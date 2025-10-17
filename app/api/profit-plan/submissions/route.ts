import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { webFormSubmissions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    console.log('[Submissions API] GET request received');
    
    // Check authentication
    const user = await getUser();
    console.log('[Submissions API] User:', user ? `${user.email} (${user.role})` : 'null');
    
    if (!user || (user.role !== 'owner' && user.role !== 'admin')) {
      console.log('[Submissions API] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized - requires owner or admin role' },
        { status: 403 }
      );
    }

    // Fetch all submissions, ordered by most recent first
    console.log('[Submissions API] Fetching from database...');
    const submissions = await db
      .select()
      .from(webFormSubmissions)
      .orderBy(desc(webFormSubmissions.createdAt));

    console.log('[Submissions API] Found', submissions.length, 'submissions');
    return NextResponse.json(submissions);
  } catch (error) {
    console.error('[Submissions API] Error fetching:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

