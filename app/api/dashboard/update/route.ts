import { NextResponse } from 'next/server';
import { updateDashboardData } from '@/lib/db/dashboard-updates';
import { getTeamForUser } from '@/lib/db/queries';

export async function POST() {
  try {
    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json(
        { error: 'No team found for user' },
        { status: 404 }
      );
    }

    // Update dashboard data for the team
    await updateDashboardData(team.id);

    return NextResponse.json({ 
      success: true, 
      message: 'Dashboard data updated successfully',
      teamId: team.id 
    });
  } catch (error) {
    console.error('Error updating dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard data' },
      { status: 500 }
    );
  }
}
