import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { invitations, teams, teamMembers, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { sendInvitationEmail, generateInviteLink } from '@/lib/email/invitation';

// POST - Send invitation to new user
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isMainAdmin = user.email === 'galaljobah@gmail.com';
    const isAdmin = user.role === 'admin' || user.role === 'owner' || isMainAdmin;
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Check if invitation already exists
    const existingInvitation = await db
      .select()
      .from(invitations)
      .where(and(
        eq(invitations.email, email),
        eq(invitations.teamId, teamId),
        eq(invitations.status, 'pending')
      ))
      .limit(1);

    if (existingInvitation.length > 0) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 400 }
      );
    }

    // Create invitation
    const [invitation] = await db
      .insert(invitations)
      .values({
        teamId,
        email,
        role,
        invitedBy: user.id,
        status: 'pending',
      })
      .returning();

    // Get inviter details for email
    const [inviter] = await db
      .select({ name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    const [team] = await db
      .select({ name: teams.name })
      .from(teams)
      .where(eq(teams.id, teamId))
      .limit(1);

    // Generate invitation link
    const inviteLink = generateInviteLink(invitation.id);

    // Send email invitation
    const emailSent = await sendInvitationEmail({
      to: email,
      inviterName: inviter?.name || 'Team Admin',
      teamName: team?.name || 'Your Team',
      inviteLink,
      role,
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        inviteLink,
      },
      emailSent,
    });
  } catch (error) {
    console.error('Error sending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}

// GET - Get pending invitations
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const isMainAdmin = user.email === 'galaljobah@gmail.com';
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

    // Get pending invitations
    const pendingInvitations = await db
      .select()
      .from(invitations)
      .where(and(
        eq(invitations.teamId, teamId),
        eq(invitations.status, 'pending')
      ));

    return NextResponse.json({ invitations: pendingInvitations });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}
