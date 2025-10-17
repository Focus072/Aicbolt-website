import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUser();
    
    // Only admins can access organization list
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.username !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get all teams with their creator information
    const organizations = await db
      .select({
        id: teams.id,
        name: teams.name,
        createdAt: teams.createdAt,
        // Get the creator (first team member or user who created the team)
        creatorName: users.name,
        creatorUsername: users.username,
      })
      .from(teams)
      .leftJoin(teamMembers, eq(teams.id, teamMembers.teamId))
      .leftJoin(users, eq(teamMembers.userId, users.id))
      .orderBy(teams.createdAt);

    // Format the organizations with creator names
    const formattedOrgs = organizations.map(org => ({
      id: org.id,
      name: org.name,
      displayName: org.creatorName ? `${org.creatorName} Organization` : org.name,
      creatorName: org.creatorName,
      creatorUsername: org.creatorUsername,
      createdAt: org.createdAt,
    }));

    return NextResponse.json({
      success: true,
      organizations: formattedOrgs,
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}
