import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { zipRequests } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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

// PATCH /api/zipcodes/:id - Update zip code request status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (API key or admin session)
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.username === 'admin';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    if (!hasValidApiKey && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

        if (!status || !['active', 'pending', 'processing', 'done'].includes(status)) {
          return NextResponse.json(
            { error: 'Invalid status provided. Must be "active", "pending", "processing", or "done".' },
            { status: 400 }
          );
        }

    const [updatedZipRequest] = await db
      .update(zipRequests)
      .set({ status: status as any })
      .where(eq(zipRequests.id, id))
      .returning();

    if (!updatedZipRequest) {
      return NextResponse.json({ error: 'Zip code request not found' }, { status: 404 });
    }

    // Update category status after status change
    await updateCategoryStatus();

    return NextResponse.json(
      {
        success: true,
        message: `Zip code request ${id} updated to status "${status}"`,
        data: updatedZipRequest,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating zip code request:', error);
    return NextResponse.json(
      { error: 'Failed to update zip code request' },
      { status: 500 }
    );
  }
}

// DELETE /api/zipcodes/:id - Delete zip code request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (API key or admin session)
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.username === 'admin';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    if (!hasValidApiKey && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    // Check if the request exists
    const existingRequest = await db
      .select()
      .from(zipRequests)
      .where(eq(zipRequests.id, id))
      .limit(1);

    if (existingRequest.length === 0) {
      return NextResponse.json({ error: 'Zip code request not found' }, { status: 404 });
    }

    // Delete the request
    await db
      .delete(zipRequests)
      .where(eq(zipRequests.id, id));

    console.log(`Deleted zip code request ${id}`);

    // Update category status after deletion
    await updateCategoryStatus();

    return NextResponse.json(
      {
        success: true,
        message: `Zip code request ${id} deleted successfully`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting zip code request:', error);
    return NextResponse.json(
      { error: 'Failed to delete zip code request' },
      { status: 500 }
    );
  }
}