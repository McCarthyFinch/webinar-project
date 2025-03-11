import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/signup' || path.startsWith('/api/auth');

  // Check if user is authenticated by checking for the user_id cookie
  const isAuthenticated = request.cookies.has('user_id');

  // If the path is not public and the user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    // Create the URL to redirect to with the 'from' parameter
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If the path is public and the user is authenticated, redirect to home page
  // This prevents authenticated users from accessing login/signup pages
  if (isPublicPath && isAuthenticated && (path === '/login' || path === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Otherwise, continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public image files)
     * - public/ (other public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 