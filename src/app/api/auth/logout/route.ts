import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// This route needs to be dynamic because it uses cookies
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Clear the session cookie
    const cookieStore = cookies();
    cookieStore.delete('user_id');
    
    return NextResponse.json(
      { message: 'Logout successful' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
} 