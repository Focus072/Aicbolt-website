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

    // Get grouped leads with counts
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
          isNotNull(leads.categoryId)
        )
      )
      .groupBy(leads.zipcode, leads.categoryId, categories.name)
      .orderBy(desc(sql`COUNT(*)`));

    // Get status counts for each group
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
          isNotNull(leads.categoryId)
        )
      )
      .groupBy(leads.zipcode, leads.categoryId, leads.status);

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
      };
    });

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