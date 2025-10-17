import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { leads } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getUser();
    const isMainAdmin = user?.username === 'admin';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Total leads count
    const [totalLeadsResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(leads);

    const totalLeads = totalLeadsResult?.count || 0;

    // Leads by status
    const leadsByStatus = await db
      .select({
        status: leads.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(leads)
      .groupBy(leads.status);

    // Leads added per day (last 30 days)
    const leadsPerDay = await db
      .select({
        date: sql<string>`TO_CHAR(created_at, 'MM/DD')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(leads)
      .where(sql`created_at >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`TO_CHAR(created_at, 'MM/DD'), DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Recent leads (last 7 days)
    const [recentLeadsResult] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(leads)
      .where(sql`created_at >= NOW() - INTERVAL '7 days'`);

    const recentLeads = recentLeadsResult?.count || 0;

    return NextResponse.json({
      totalLeads,
      leadsByStatus,
      leadsPerDay,
      recentLeads,
    });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


