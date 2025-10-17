import { NextRequest, NextResponse } from 'next/server';
import { getRevenue, createRevenue } from '@/lib/db/business-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const revenue = await getRevenue(startDate, endDate);
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('POST /api/revenue - Received data:', data);
    
    // Convert date string back to Date object if it exists
    if (data.date && typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    
    const revenue = await createRevenue(data);
    console.log('POST /api/revenue - Created revenue:', revenue);
    
    return NextResponse.json(revenue, { status: 201 });
  } catch (error) {
    console.error('Error creating revenue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create revenue' },
      { status: 500 }
    );
  }
}

