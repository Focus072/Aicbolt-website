import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUser();
    
    // Only admins can switch organizations
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.username !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Verify the organization exists
    const organization = await db
      .select()
      .from(teams)
      .where(eq(teams.id, organizationId))
      .limit(1);

    if (organization.length === 0) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Set the organization context in a cookie
    const cookieStore = await cookies();
    cookieStore.set('currentOrganizationId', organizationId.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return NextResponse.json({
      success: true,
      message: `Switched to ${organization[0].name}`,
      organization: {
        id: organization[0].id,
        name: organization[0].name,
      },
    });

  } catch (error) {
    console.error('Error switching organization:', error);
    return NextResponse.json(
      { error: 'Failed to switch organization' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser();
    
    // Only admins can get current organization
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.username !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const cookieStore = await cookies();
    const currentOrgId = cookieStore.get('currentOrganizationId')?.value;

    if (!currentOrgId) {
      return NextResponse.json({
        success: true,
        currentOrganization: null,
      });
    }

    // Get the current organization details
    const organization = await db
      .select()
      .from(teams)
      .where(eq(teams.id, parseInt(currentOrgId)))
      .limit(1);

    if (organization.length === 0) {
      return NextResponse.json({
        success: true,
        currentOrganization: null,
      });
    }

    return NextResponse.json({
      success: true,
      currentOrganization: {
        id: organization[0].id,
        name: organization[0].name,
      },
    });

  } catch (error) {
    console.error('Error getting current organization:', error);
    return NextResponse.json(
      { error: 'Failed to get current organization' },
      { status: 500 }
    );
  }
}
