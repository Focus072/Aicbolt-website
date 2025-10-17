import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { checkRateLimit, getClientIdentifier, RateLimits } from '@/lib/rate-limit';
import { hashPassword } from '@/lib/auth/session';

// Check if user is super admin
async function isSuperAdmin(): Promise<boolean> {
  const currentUser = await getUser();
  return currentUser?.username === 'admin';
}

export async function GET(request: NextRequest) {
  try {
    // Check super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }

    // Fetch all users except deleted ones
    const allUsers = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        role: users.role,
        allowedPages: users.allowedPages,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.deletedAt, null as any))
      .orderBy(users.createdAt);

    return NextResponse.json({
      success: true,
      users: allUsers,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(clientId, RateLimits.ACCOUNT_CREATE);
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many account creation requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check super admin access
    if (!(await isSuperAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized - Super admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.username || !body.name || !body.password) {
      return NextResponse.json(
        { error: 'Username, name, and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, body.username))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const passwordHash = await hashPassword(body.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name: body.name,
        username: body.username,
        passwordHash,
        role: body.role || 'client',
        allowedPages: body.allowedPages || null,
        isActive: true, // Users are immediately active
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create user' },
      { status: 500 }
    );
  }
}

