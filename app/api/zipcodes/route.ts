import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { zipRequests, categories } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { updateCategoryStatus } from '@/lib/db/category-status';

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

// POST /api/zipcodes - Create new zip code requests
export async function POST(request: NextRequest) {
  try {
    // Check authentication (API key or admin session)
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.email === 'galaljobah@gmail.com';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    console.log('🔐 POST Authentication check:', {
      hasValidApiKey,
      userEmail: user?.email,
      userRole: user?.role,
      isMainAdmin,
      isAdmin
    });

    if (!hasValidApiKey && !isAdmin) {
      console.log('❌ POST Authentication failed');
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    console.log('✅ POST Authentication successful');

    const body = await request.json();
    
    console.log('📥 Zip codes POST request body:', body);
    console.log('📥 Request headers:', Object.fromEntries(request.headers.entries()));
    
    // Validate input
    if (!body.zip && !body.zips) {
      console.log('❌ Missing zip or zips field');
      return NextResponse.json(
        { error: 'Missing required field: zip or zips' },
        { status: 400 }
      );
    }

    // Handle single zip or multiple zips
    const zipCodes = body.zips || [body.zip];
    console.log('📊 Parsed zip codes:', zipCodes);
    
    if (!Array.isArray(zipCodes) || zipCodes.length === 0) {
      console.log('❌ Invalid zip codes format');
      return NextResponse.json(
        { error: 'Invalid zip codes format' },
        { status: 400 }
      );
    }

    // Validate zip codes
    const validZipCodes = zipCodes.filter(zip => 
      typeof zip === 'string' && zip.trim().length > 0
    );
    console.log('📊 Valid zip codes:', validZipCodes);

    if (validZipCodes.length === 0) {
      console.log('❌ No valid zip codes provided');
      return NextResponse.json(
        { error: 'No valid zip codes provided' },
        { status: 400 }
      );
    }

    // Insert zip codes with pending status and category_id
    const zipData = validZipCodes.map(zip => ({
      zip: zip.trim(),
      status: 'pending' as const,
      categoryId: body.category_id ? parseInt(body.category_id) : null,
    }));

    const result = await db
      .insert(zipRequests)
      .values(zipData)
      .returning();

    console.log(`Created ${result.length} zip code requests`);
    console.log('📊 Created zip codes:', result.map(r => ({ id: r.id, zip: r.zip, status: r.status, categoryId: r.categoryId })));

    // Update category status after creating new requests (don't fail if this errors)
    try {
      console.log('🔄 Updating category status after zip code creation...');
      await updateCategoryStatus();
      console.log('✅ Category status updated successfully');
    } catch (updateError) {
      console.error('⚠️ Category status update failed, but zip codes were created:', updateError);
      // Don't throw - zip codes were created successfully
    }

    // Always return success with the created zip codes
    return NextResponse.json({
      success: true,
      message: `${result.length} zip code request${result.length > 1 ? 's' : ''} created successfully`,
      data: result,
      count: result.length,
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Error creating zip code requests:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        error: 'Failed to create zip code requests',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET /api/zipcodes - Retrieve zip code requests
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

        // Validate status parameter
        if (status && !['active', 'pending', 'processing', 'done'].includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status. Must be: active, pending, processing, or done' },
            { status: 400 }
          );
        }

    // Build query with category join
    let query = db
      .select({
        id: zipRequests.id,
        zip: zipRequests.zip,
        status: zipRequests.status,
        categoryId: zipRequests.categoryId,
        categoryName: categories.name,
      })
      .from(zipRequests)
      .leftJoin(categories, eq(zipRequests.categoryId, categories.id));

    if (status) {
      query = query.where(eq(zipRequests.status, status as any));
    }

    const result = await query
      .orderBy(desc(zipRequests.createdAt))
      .limit(Math.min(limit, 1000)) // Cap at 1000
      .offset(offset);

    // Get total count for pagination
    const totalQuery = status 
      ? db.select().from(zipRequests).where(eq(zipRequests.status, status as any))
      : db.select().from(zipRequests);
    
    const totalCount = await totalQuery;

    console.log(`Retrieved ${result.length} zip code requests (status: ${status || 'all'})`);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
      total: totalCount.length,
      status: status || 'all',
    });

  } catch (error) {
    console.error('Error retrieving zip code requests:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve zip code requests' },
      { status: 500 }
    );
  }
}
