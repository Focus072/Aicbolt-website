import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { webFormSubmissions } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const { id } = params;

    // Delete the submission (hard delete as per requirements)
    await db
      .delete(webFormSubmissions)
      .where(eq(webFormSubmissions.id, id));

    console.log(`[Submissions] Rejected and deleted: ${id} by ${user.email}`);

    // Optional: Fire analytics
    // window.gtag?.('event', 'profit_plan_rejected');

    return NextResponse.json({ message: 'Submission rejected and deleted' });
  } catch (error) {
    console.error('[Submissions] Error deleting:', error);
    return NextResponse.json(
      { error: 'Failed to delete submission' },
      { status: 500 }
    );
  }
}

