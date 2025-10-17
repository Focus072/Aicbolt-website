import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { webFormSubmissions } from '@/lib/db/schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bot protection: honeypot field
    if (body.website && body.website.trim() !== '') {
      console.log('[Security] Bot detected via honeypot field');
      // Return success to not tip off bots
      return NextResponse.json({ id: 'blocked' }, { status: 200 });
    }

    // Validate required fields
    if (!body.name || !body.email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Sanitize and prepare data
    const submissionData = {
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      company: body.company ? String(body.company).trim() : null,
      profession: body.profession ? String(body.profession).trim() : null,
      industry: body.industry || null,
      primaryGoal: body.primaryGoal || null,
      targetAudience: body.targetAudience || null,
      stylePreference: body.stylePreference || null,
      inspirations: body.inspirations || null,
      budget: body.budget || null,
      timeline: body.timeline || null,
      features: Array.isArray(body.features) ? body.features : [],
      contentTypes: Array.isArray(body.contentTypes) ? body.contentTypes : [],
      additionalInfo: body.additionalInfo || null,
      honeypot: null, // Never store honeypot value
      status: 'pending' as const,
    };

    // Insert into database
    const [submission] = await db
      .insert(webFormSubmissions)
      .values(submissionData)
      .returning({ id: webFormSubmissions.id });

    console.log(`[Profit Plan] New submission: ${submission.id} from ${submissionData.email}`);

    // Optional: Fire analytics event
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', 'profit_plan_submitted', {
    //     email: submissionData.email
    //   });
    // }

    return NextResponse.json(
      { 
        id: submission.id,
        message: 'Submission received successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Profit Plan Submit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process submission. Please try again.' },
      { status: 500 }
    );
  }
}

