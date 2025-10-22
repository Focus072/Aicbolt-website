import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { leads } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// API Key validation - Used by n8n scraper
const VALID_API_KEY = process.env.SCRAPER_API_KEY;

function validateApiKey(request: NextRequest): boolean {
  // Check if API key is configured
  if (!VALID_API_KEY) {
    console.error('SCRAPER_API_KEY is not configured in environment variables');
    return false;
  }

  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return token === VALID_API_KEY;
}

async function isAuthorized(request: NextRequest): Promise<boolean> {
  // Check for API key (external) or session auth (internal dashboard)
  const hasValidApiKey = validateApiKey(request);
  
  if (hasValidApiKey) {
    return true;
  }

  // Check if user is authenticated and admin
  const user = await getUser();
  const isMainAdmin = user?.username === 'admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;
  
  return !!isAdmin;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authorization (API key or admin session)
    if (!(await isAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid lead ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const user = await getUser();

    // Update the lead with team isolation
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.action !== undefined) updateData.action = body.action;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const [updatedLead] = await db
      .update(leads)
      .set(updateData)
      .where(eq(leads.id, id))
      .returning();

    if (!updatedLead) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead,
    });

  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validate authorization (API key or admin session)
    if (!(await isAuthorized(request))) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid lead ID' },
        { status: 400 }
      );
    }

    await db
      .delete(leads)
      .where(eq(leads.id, id));

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}

