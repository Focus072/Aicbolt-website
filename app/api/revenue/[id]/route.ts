import { NextRequest, NextResponse } from 'next/server';
import { updateRevenue, deleteRevenue, getRevenueById } from '@/lib/db/business-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid revenue ID' }, { status: 400 });
    }

    const revenue = await getRevenueById(id);
    if (!revenue) {
      return NextResponse.json({ error: 'Revenue not found' }, { status: 404 });
    }
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Error fetching revenue:', error);
    return NextResponse.json(
      { error: 'Failed to fetch revenue' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid revenue ID' }, { status: 400 });
    }

    const data = await request.json();
    
    // Convert date string back to Date object if it exists
    if (data.date && typeof data.date === 'string') {
      data.date = new Date(data.date);
    }
    
    const revenue = await updateRevenue(id, data);
    
    return NextResponse.json(revenue);
  } catch (error) {
    console.error('Error updating revenue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update revenue' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid revenue ID' }, { status: 400 });
    }

    await deleteRevenue(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting revenue:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete revenue' },
      { status: 500 }
    );
  }
}
