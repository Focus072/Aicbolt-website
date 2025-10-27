import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { leads, categories } from '@/lib/db/schema';
import { eq, desc, sql, and, isNotNull } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get grouped leads with counts (scraped leads)
    const groupedLeads = await db
      .select({
        zipcode: leads.zipcode,
        categoryId: leads.categoryId,
        categoryName: categories.name,
        leadCount: sql<number>`COUNT(*)::int`,
      })
      .from(leads)
      .leftJoin(categories, eq(leads.categoryId, categories.id))
      .where(
        and(
          isNotNull(leads.zipcode),
          isNotNull(leads.categoryId),
          eq(leads.isManual, false)
        )
      )
      .groupBy(leads.zipcode, leads.categoryId, categories.name)
      .orderBy(desc(sql`COUNT(*)`));

    // Get manual leads count
    const manualLeadsCount = await db
      .select({
        leadCount: sql<number>`COUNT(*)::int`,
      })
      .from(leads)
      .where(eq(leads.isManual, true));

    // Get status counts for scraped groups
    const statusCounts = await db
      .select({
        zipcode: leads.zipcode,
        categoryId: leads.categoryId,
        status: leads.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(leads)
      .where(
        and(
          isNotNull(leads.zipcode),
          isNotNull(leads.categoryId),
          eq(leads.isManual, false)
        )
      )
      .groupBy(leads.zipcode, leads.categoryId, leads.status);

    // Get status counts for manual leads
    const manualStatusCounts = await db
      .select({
        status: leads.status,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(leads)
      .where(eq(leads.isManual, true))
      .groupBy(leads.status);

    // Transform data to include status summaries
    const transformedData = groupedLeads.map(group => {
      const statusSummary: Record<string, number> = {};
      const groupStatusCounts = statusCounts.filter(
        sc => sc.zipcode === group.zipcode && sc.categoryId === group.categoryId
      );
      
      groupStatusCounts.forEach(sc => {
        statusSummary[sc.status] = sc.count;
      });

      return {
        zipcode: group.zipcode,
        categoryId: group.categoryId,
        categoryName: group.categoryName || 'Unknown Category',
        leadCount: group.leadCount,
        statusSummary,
        isManual: false,
      };
    });

    // Add manual leads group if there are any manual leads
    const manualCount = manualLeadsCount[0]?.leadCount || 0;
    if (manualCount > 0) {
      const manualStatusSummary: Record<string, number> = {};
      manualStatusCounts.forEach(sc => {
        manualStatusSummary[sc.status] = sc.count;
      });

      transformedData.unshift({
        zipcode: 'Manual Leads',
        categoryId: null,
        categoryName: 'Manual Leads',
        leadCount: manualCount,
        statusSummary: manualStatusSummary,
        isManual: true,
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: transformedData,
      count: transformedData.length 
    });

  } catch (error) {
    console.error('Error fetching grouped leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grouped leads' },
      { status: 500 }
    );
  }
}