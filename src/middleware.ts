import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET as string;
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  
  // Create base response and set COOP header for Google GIS compatibility
  const applySecurityHeaders = (response: NextResponse) => {
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    return response;
  };

  // Public API routes (including Google auth endpoints)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/tracker')) {
    return applySecurityHeaders(NextResponse.next());
  }

  // Protected API routes
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return applySecurityHeaders(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }
    try {
      await jwtVerify(token, secret);
      return applySecurityHeaders(NextResponse.next());
    } catch (e) {
      return applySecurityHeaders(NextResponse.json({ error: 'Invalid token' }, { status: 401 }));
    }
  }

  // Protected pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  if (!token) {
    if (!isAuthPage && pathname !== '/') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/login', request.url)));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  try {
    await jwtVerify(token, secret);
    
    // Redirect authenticated users away from auth pages to agenda
    if (isAuthPage) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/tracker/agenda', request.url)));
    }

    return applySecurityHeaders(NextResponse.next());
  } catch (e) {
    // Invalid token, clear cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return applySecurityHeaders(response);
  }
}

export const config = {
  matcher: [
    '/tracker/:path*',
    '/syllabus/:path*',
    '/tests/:path*',
    '/routine/:path*',
    '/timetable/:path*',
    '/api/:path*',
    '/login',
    '/register'
  ]
};
