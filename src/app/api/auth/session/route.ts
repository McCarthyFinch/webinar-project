import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';

// This route needs to be dynamic because it uses cookies
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get the user ID from the cookie
    const cookieStore = cookies();
    const userId = cookieStore.get('user_id')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });
    
    if (!user) {
      // Clear the invalid cookie
      cookieStore.delete('user_id');
      
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }
    
    // Return user without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json(
      { authenticated: true, user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session check error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred while checking session' },
      { status: 500 }
    );
  }
} 