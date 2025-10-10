import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_token')?.value;

  // Nếu là trang login thì cho phép vào
  if (pathname.startsWith('/login-admin/login')) {
    return NextResponse.next();
  }

  // Nếu là admin nhưng không có token → redirect về login
  if (pathname.startsWith('/admin') && !token) {
    return NextResponse.redirect(new URL('/login-admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
