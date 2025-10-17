import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = '/dashboard';
const adminRoutes = '/account';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = pathname.startsWith(protectedRoutes);
  const isAdminRoute = pathname.startsWith(adminRoutes);

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === 'GET') {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      
      // Check admin access for admin routes
      if (isAdminRoute) {
        const isMainAdmin = parsed.email === 'galaljobah@gmail.com';
        const isAdmin = parsed.role === 'admin' || parsed.role === 'owner' || isMainAdmin;
        
        // Debug: Log user info
        console.log('Admin route access check:', {
          email: parsed.email,
          role: parsed.role,
          isMainAdmin,
          isAdmin
        });
        
        // Temporarily allow access for any logged-in user for testing
        // TODO: Remove this and implement proper admin check
        // if (!isMainAdmin && !isAdmin) {
        //   return NextResponse.redirect(new URL('/dashboard', request.url));
        // }
      }

      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString()
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
  runtime: 'nodejs'
};
