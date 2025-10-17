import { NextResponse } from 'next/server';
import {
  getBusinessAnalytics,
  getRevenueByMonth,
  getExpensesByCategory,
  getTopClients,
} from '@/lib/db/business-queries';
import { getCachedData, setCachedData, CacheKeys } from '@/lib/cache';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check cache first
    const cached = getCachedData(CacheKeys.ANALYTICS);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, max-age=60',
          'X-Cache': 'HIT'
        }
      });
    }

    const [analytics, revenueByMonth, expensesByCategory, topClients] =
      await Promise.all([
        getBusinessAnalytics(),
        getRevenueByMonth(12),
        getExpensesByCategory(),
        getTopClients(5),
      ]);

    const result = {
      analytics,
      revenueByMonth,
      expensesByCategory,
      topClients,
    };

    // Cache the result
    setCachedData(CacheKeys.ANALYTICS, result);

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, max-age=60',
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return NextResponse.json(
      { error: errorMessage, details: String(error) },
      { status: 500 }
    );
  }
}

