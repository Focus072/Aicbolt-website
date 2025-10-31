import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { leads } from '@/lib/db/schema';
import { eq, desc, and, isNotNull, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// Force dynamic rendering since we use cookies for authentication
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const zipcode = searchParams.get('zipcode');
    const categoryId = searchParams.get('categoryId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    if (!zipcode) {
      return NextResponse.json(
        { error: 'zipcode is required' },
        { status: 400 }
      );
    }

    let leadsData;
    let totalCount;

    // Handle manual leads
    if (zipcode === 'Manual Leads') {
      leadsData = await db
        .select()
        .from(leads)
        .where(eq(leads.isManual, true))
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset);

      totalCount = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(leads)
        .where(eq(leads.isManual, true));
    } else {
      // Handle regular zipcode/category groups
      if (!categoryId) {
        return NextResponse.json(
          { error: 'categoryId is required for non-manual leads' },
          { status: 400 }
        );
      }

      leadsData = await db
        .select()
        .from(leads)
        .where(
          and(
            eq(leads.zipcode, zipcode),
            eq(leads.categoryId, parseInt(categoryId))
          )
        )
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset);

      totalCount = await db
        .select({ count: sql<number>`COUNT(*)::int` })
        .from(leads)
        .where(
          and(
            eq(leads.zipcode, zipcode),
            eq(leads.categoryId, parseInt(categoryId))
          )
        );
    }

    return NextResponse.json({
      success: true,
      data: leadsData,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching leads by group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads by group' },
      { status: 500 }
    );
  }
}