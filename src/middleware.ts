import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {

  // ---------------------------------------------
  // gestione account middleware middleware
  const accountsCenterBaseUrl = process.env.NEXT_PUBLIC_ACCOUNT_CENTER_BASE_URL;
  
  if (request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(
      new URL(`${accountsCenterBaseUrl}/login?redirect=ondemand`, request.url)
    );
  }

  if (request.nextUrl.pathname.startsWith('/logout')) {
    return NextResponse.redirect(
      new URL(`${accountsCenterBaseUrl}/logout?redirect=ondemand`, request.url)
    );
  }
}

export const config = {
  matcher: ['/login/:path*', '/logout/:path*'],
};
