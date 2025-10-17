import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { users } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { hashPassword } from '@/lib/auth/session';

// Check if user is admin
async function isAdmin(): Promise<boolean> {
  const currentUser = await getUser();
  return currentUser?.role === 'admin' || currentUser?.role === 'owner' || currentUser?.username === 'admin';
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin access
    if (!(await isAdmin())) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current user and target user
    const currentUser = await getUser();
    const targetUser = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (currentUser?.id === userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 403 }
      );
    }

    // Prevent deleting super admin
    if (targetUser[0].username === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete super admin account' },
        { status: 403 }
      );
    }

    // Actually delete user from database
    await db
      .delete(users)
      .where(eq(users.id, userId));

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const hasValidApiKey = validateApiKey(request);
    const user = await getUser();
    const isMainAdmin = user?.email === 'galaljobah@gmail.com';
    const isAdmin = user?.role === 'admin' || user?.role === 'owner' || isMainAdmin;

    if (!hasValidApiKey && !isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, username, password, role, allowedPages, organizationId } = body;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if username is being changed and if it already exists
    if (username && username !== existingUser[0].username) {
      const usernameExists = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      if (usernameExists.length > 0) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name: name || existingUser[0].name,
      username: username || existingUser[0].username,
      role: role || existingUser[0].role,
      allowedPages: role === 'admin' ? null : allowedPages || existingUser[0].allowedPages,
      organizationId: organizationId !== undefined ? organizationId : existingUser[0].organizationId,
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
      const passwordHash = await hashPassword(password);
      updateData.passwordHash = passwordHash;
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          username: updatedUser.username,
          role: updatedUser.role,
          allowedPages: updatedUser.allowedPages,
          organizationId: updatedUser.organizationId,
        },
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}


