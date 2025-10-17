import { NextRequest, NextResponse } from 'next/server';
import { getExpenses, createExpense } from '@/lib/db/business-queries';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    const expenses = await getExpenses(category, startDate, endDate);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log('POST /api/expenses - Received data:', data);
    
    // Convert expenseDate string back to Date object if it exists
    if (data.expenseDate && typeof data.expenseDate === 'string') {
      data.expenseDate = new Date(data.expenseDate);
    }
    
    const expense = await createExpense(data);
    console.log('POST /api/expenses - Created expense:', expense);
    
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create expense' },
      { status: 500 }
    );
  }
}

