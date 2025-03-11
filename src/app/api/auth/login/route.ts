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
    
    // Get the hostname from the request to determine if we're in production
    const hostname = request.headers.get('host') || '';
    const isProduction = 
      process.env.NODE_ENV === 'production' || 
      !hostname.includes('localhost');

    // Set cookie with appropriate options for the environment
    cookieStore.set('user_id', String(user.id), {
      httpOnly: true,
      secure: isProduction, // Only use secure in production/deployment
      sameSite: 'lax',  // Increased security but still allows redirects
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    // Log cookie for debugging
    console.log('Set cookie for user:', user.id, 'is production:', isProduction);
    
    return NextResponse.json(
      { 
        message: 'Login successful', 
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isAdmin: user.isAdmin
        } 
      },
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