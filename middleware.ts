import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their allowed roles
const protectedRoutes = {
  '/dashboard': ['teacher', 'student', 'principal'],
  '/exam': ['teacher', 'student'],
  '/result': ['teacher', 'student', 'principal'],
  '/profile': ['teacher', 'student', 'principal'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the route is protected
  const isProtectedRoute = Object.keys(protectedRoutes).some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // For protected routes, we'll let the client-side handle authentication
    // The client-side will check localStorage and redirect if needed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/exam/:path*',
    '/result/:path*',
    '/profile/:path*',
  ],
}; 