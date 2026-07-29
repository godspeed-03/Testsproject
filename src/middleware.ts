import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-prod';
const secret = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  
  // Public API routes
  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/register') || pathname.startsWith('/api/tracker')) {
    return NextResponse.next();
  }

  // Protected API routes
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
      await jwtVerify(token, secret);
      return NextResponse.next();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  // Protected pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
  
  if (!token) {
    if (!isAuthPage && pathname !== '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    await jwtVerify(token, secret);
    
    // Redirect authenticated users away from auth pages to revision
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/revision', request.url));
    }

    return NextResponse.next();
  } catch (e) {
    // Invalid token, clear cookie
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/revision/:path*',
    '/daily/:path*',
    '/syllabus/:path*',
    '/tests/:path*',
    '/timetable/:path*',
    '/api/:path*',
    '/login',
    '/register'
  ]
};
