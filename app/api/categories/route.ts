import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { categories, zipRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { getActiveCategories, updateCategoryStatus } from '@/lib/db/category-status';

// API Key validation - Used by n8n scraper
const VALID_API_KEY = process.env.SCRAPER_API_KEY;

const validateApiKey = (request: NextRequest): boolean => {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token === VALID_API_KEY;
};

// GET /api/categories - Retrieve all active categories
export async function GET(request: NextRequest) {
  try {
    // Check authentication (API key or admin session)
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.email === 'galaljobah@gmail.com';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    console.log('🔐 Categories API Auth Check:', {
      hasValidApiKey,
      userEmail: user?.email,
      userRole: user?.role,
      isMainAdmin,
      isAdmin
    });

    if (!hasValidApiKey && !isAdmin) {
      console.log('❌ Categories API: Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    console.log('✅ Categories API: Authentication successful');

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';

    // Try to update category status, but don't fail if it errors
    try {
      await updateCategoryStatus();
      console.log('✅ Category status updated successfully');
    } catch (updateError) {
      console.error('⚠️ Category status update failed, continuing with current status:', updateError);
    }

    // Get all categories (both active and inactive)
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        status: categories.status,
      })
      .from(categories)
      .orderBy(categories.name);

    console.log(`✅ Retrieved ${result.length} categories`);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      status: 'active',
    });

  } catch (error) {
    console.error('Error retrieving categories:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    // Check authentication (API key or admin session)
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.email === 'galaljobah@gmail.com';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    if (!hasValidApiKey && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const categoryData = {
      name: body.name.trim(),
      status: body.status || 'active',
    };

    // Insert new category
    const [newCategory] = await db
      .insert(categories)
      .values(categoryData)
      .returning();

    console.log(`Created new category: ${newCategory.name}`);

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      data: newCategory,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating category:', error);
    
    if (error.code === '23505') { // Unique constraint violation
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
