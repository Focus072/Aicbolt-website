import { NextResponse } from 'next/server';
import { getCompleteDashboardData } from '@/lib/db/queries';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const dashboardData = await getCompleteDashboardData();

    if (!dashboardData) {
      return NextResponse.json(
        { error: 'No team found for user' },
        { status: 404 }
      );
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}

