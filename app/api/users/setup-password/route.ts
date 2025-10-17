import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users, invitations, teamMembers } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';

// POST - Set password for invited user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { inviteId, password } = body;

    if (!inviteId || !password) {
      return NextResponse.json(
        { error: 'Invite ID and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Find the invitation
    const [invitation] = await db
      .select()
      .from(invitations)
      .where(and(
        eq(invitations.id, parseInt(inviteId)),
        eq(invitations.status, 'pending')
      ))
      .limit(1);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, invitation.email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create the user
    const [newUser] = await db
      .insert(users)
      .values({
        email: invitation.email,
        name: invitation.email.split('@')[0], // Use email prefix as default name
        passwordHash,
        role: invitation.role,
      })
      .returning();

    // Add user to team
    await db
      .insert(teamMembers)
      .values({
        userId: newUser.id,
        teamId: invitation.teamId,
        role: invitation.role,
      });

    // Update invitation status
    await db
      .update(invitations)
      .set({ status: 'accepted' })
      .where(eq(invitations.id, invitation.id));

    return NextResponse.json({
      success: true,
      message: 'Password set successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error('Error setting up password:', error);
    return NextResponse.json(
      { error: 'Failed to set up password' },
      { status: 500 }
    );
  }
}
