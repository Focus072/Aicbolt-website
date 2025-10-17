import { NextRequest, NextResponse } from 'next/server';
import { updateExpense, deleteExpense, getExpenseById } from '@/lib/db/business-queries';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id) || id <= 0) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    const expense = await getExpenseById(id);
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    return NextResponse.json(
      { error: 'Failed to fetch expense' },
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
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    const data = await request.json();
    
    // Convert expenseDate string back to Date object if it exists
    if (data.expenseDate && typeof data.expenseDate === 'string') {
      data.expenseDate = new Date(data.expenseDate);
    }
    
    const expense = await updateExpense(id, data);
    
    return NextResponse.json(expense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update expense' },
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
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    await deleteExpense(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete expense' },
      { status: 500 }
    );
  }
}
