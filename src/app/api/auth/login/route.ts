import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, LoginData } from '@/lib/auth';
import { cookies } from 'next/headers';

// This route needs to be dynamic because it uses cookies
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as LoginData;
    
    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Authenticate user
    const user = await authenticateUser({ email, password });
    
    // Set a session cookie (in a real app, you'd use a proper session management system)
    const cookieStore = cookies();
    cookieStore.set('user_id', String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    return NextResponse.json(
      { message: 'Login successful', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    if (error instanceof Error && error.message === 'Invalid email or password') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 