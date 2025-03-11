import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// Mark route as dynamic to avoid static generation warnings
export const dynamic = 'force-dynamic';

// Using Prisma client with a type workaround
// This is necessary because TypeScript can't infer the models from the Prisma schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prismaAny = prisma as any;

// GET - Fetch all users
export async function GET() {
  try {
    // Check if the requester is an admin
    const userId = cookies().get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get the user from the database
    const user = await prismaAny.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    // Check if the user exists and is an admin
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Fetch all users
    const users = await prismaAny.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc'
      }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 