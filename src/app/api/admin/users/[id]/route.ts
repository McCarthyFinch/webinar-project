import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// Mark route as dynamic to avoid static generation warnings
export const dynamic = 'force-dynamic';

// Using Prisma client with a type workaround
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaAny = prisma as any;

// Helper to check if requester is admin
async function isAdmin() {
  const userId = cookies().get('user_id')?.value;
  
  if (!userId) {
    return false;
  }
  
  const user = await prismaAny.user.findUnique({
    where: { id: parseInt(userId) }
  });
  
  return user?.isAdmin === true;
}

// PATCH - Update user (currently only supports toggling admin status)
export async function PATCH(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    // Check if requester is admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const userId = parseInt(params.id);
    const { isAdmin: makeAdmin } = await request.json();
    
    // Update the user's admin status
    const updatedUser = await prismaAny.user.update({
      where: { id: userId },
      data: { isAdmin: makeAdmin },
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      }
    });
    
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a user
export async function DELETE(
  _request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    // Check if requester is admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const userId = parseInt(params.id);
    
    // Verify user exists
    const existingUser = await prismaAny.user.findUnique({
      where: { id: userId }
    });
    
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Delete the user
    await prismaAny.user.delete({
      where: { id: userId }
    });
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
} 