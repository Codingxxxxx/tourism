import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const excludeRoutes = [
  '/admin/login'
];

export async function middleware(request: NextRequest) {
  const isAsset = /\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|ico)$/.test(request.nextUrl.pathname);

  if (isAsset) return NextResponse.next();

  const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
  // middleware apply only on admin path
  if (!isAdminPath) return NextResponse.next();

  // check if path is excluded from checking authentication
  const isExcludedRoute = excludeRoutes.some((route) => route === request.nextUrl.pathname);

  if (isExcludedRoute) return NextResponse.next();
  
  try {
    const cookieStore = await cookies();
    
    if (!cookieStore.has('session')) return NextResponse.redirect(new URL('/admin/login', request.url));
    return NextResponse.next();
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
}

export const config = {
  matcher: '/admin/:path*'
};