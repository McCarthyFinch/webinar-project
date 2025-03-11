import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/login' || 
    path === '/signup' || 
    path.startsWith('/api/auth') ||
    path.startsWith('/_next') ||  // Next.js assets
    path.includes('favicon.ico');  // Favicon
  
  // Get authentication cookie
  const userIdCookie = request.cookies.get('user_id');
  const isAuthenticated = !!userIdCookie?.value;
  
  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] Path: ${path}`);
    console.log(`[Middleware] Public: ${isPublicPath}`);
    console.log(`[Middleware] Authenticated: ${isAuthenticated}`);
    console.log(`[Middleware] Cookie: ${userIdCookie?.value}`);
  }

  // Handle API routes - skip auth checks for API paths except where needed
  if (path.startsWith('/api/') && !path.startsWith('/api/auth')) {
    // For APIs, we'll let the API routes handle their own auth
    if (!isAuthenticated) {
      // If API call requires auth but user isn't authenticated, return 401
      if (path.includes('/api/files') || 
          path.includes('/api/notes') || 
          path.includes('/api/search') ||
          path.includes('/api/admin')) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    return NextResponse.next();
  }
  
  // Special case for root path with auth (avoid potential redirect loops)
  if (path === '/' && isAuthenticated) {
    return NextResponse.next();
  }

  // If the path is not public and the user is not authenticated, redirect to login
  if (!isPublicPath && !isAuthenticated) {
    // Create the URL to redirect to with the 'from' parameter
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', path);
    return NextResponse.redirect(redirectUrl);
  }

  // If the path is public and the user is authenticated, redirect to home page
  // This prevents authenticated users from accessing login/signup pages
  if ((path === '/login' || path === '/signup') && isAuthenticated) {
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