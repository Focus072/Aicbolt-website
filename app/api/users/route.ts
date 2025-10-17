import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, teams, teamMembers } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { hashPassword } from '@/lib/auth/session';

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (galaljobah@gmail.com or has admin role)
    const isMainAdmin = user.username === 'admin';
    const isAdmin = user.role === 'admin' || user.role === 'owner' || isMainAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Get user's team
    const userTeam = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!userTeam.length) {
      return NextResponse.json({ error: 'User not in any team' }, { status: 400 });
    }

    const teamId = userTeam[0].team.id;

    // Get all team members with their details
    const teamMembersList = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role,
        teamRole: teamMembers.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(teamMembers)
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .where(eq(teamMembers.teamId, teamId))
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ users: teamMembersList });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isMainAdmin = user.username === 'admin';
    const isAdmin = user.role === 'admin' || user.role === 'owner' || isMainAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { username, name, role, teamRole = 'member' } = body;

    if (!username || !name) {
      return NextResponse.json(
        { error: 'Username and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this username already exists' },
        { status: 400 }
      );
    }

    // Get user's team
    const userTeam = await db
      .select({ team: teams })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(eq(teamMembers.userId, user.id))
      .limit(1);

    if (!userTeam.length) {
      return NextResponse.json({ error: 'User not in any team' }, { status: 400 });
    }

    const teamId = userTeam[0].team.id;

    // Create user directly (no invitation system)
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword);

    const [newUser] = await db
      .insert(users)
      .values({
        username,
        name,
        passwordHash,
        role: role || 'member',
        organizationId: teamId,
      })
      .returning();

    // Add user to team
    await db
      .insert(teamMembers)
      .values({
        userId: newUser.id,
        teamId,
        role: teamRole,
      });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role,
        teamRole,
        tempPassword, // Only for development - remove in production
      },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
