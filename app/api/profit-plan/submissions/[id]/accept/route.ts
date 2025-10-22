import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { webFormSubmissions, clients } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/db/queries';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Fetch the submission
    const [submission] = await db
      .select()
      .from(webFormSubmissions)
      .where(eq(webFormSubmissions.id, id))
      .limit(1);

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    if (submission.status !== 'pending') {
      return NextResponse.json(
        { error: 'Submission already processed' },
        { status: 400 }
      );
    }

    // Get user's actual team ID using proper team resolution
    const team = await getTeamForUser();
    const teamId = team?.id || 1; // Use resolved team ID, fallback to 1

    // Create client from submission
    const [newClient] = await db
      .insert(clients)
      .values({
        teamId: teamId,
        name: submission.name,
        email: submission.email,
        company: submission.company || '',
        phone: '', // Not collected in form
        status: 'lead', // Start as lead
        lifetimeValue: 0,
        address: '',
        notes: `Created from AI Profit Plan submission.
        
Industry: ${submission.industry || 'Not specified'}
Profession: ${submission.profession || 'Not specified'}
Primary Goal: ${submission.primaryGoal || 'Not specified'}
Budget: ${submission.budget || 'Not specified'}
Timeline: ${submission.timeline || 'Not specified'}
Style Preference: ${submission.stylePreference || 'Not specified'}
${submission.features && submission.features.length > 0 ? `\nRequested Features: ${submission.features.join(', ')}` : ''}
${submission.additionalInfo ? `\nAdditional Info: ${submission.additionalInfo}` : ''}`,
      })
      .returning();

    // Update submission status to accepted
    await db
      .update(webFormSubmissions)
      .set({
        status: 'accepted',
        reviewedBy: user.username,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(webFormSubmissions.id, id));

    console.log(`[Submissions] Accepted: ${id}, Created client: ${newClient.id} by ${user.username}`);

    // Optional: Fire analytics
    // window.gtag?.('event', 'profit_plan_accepted');

    return NextResponse.json({
      message: 'Submission accepted and client created',
      clientId: newClient.id,
    });
  } catch (error) {
    console.error('[Submissions] Error accepting:', error);
    return NextResponse.json(
      { error: 'Failed to accept submission' },
      { status: 500 }
    );
  }
}

