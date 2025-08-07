import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
 
// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const accountsCenterBaseUrl = process.env.NEXT_PUBLIC_ACCOUNT_CENTER_BASE_URL;

  return NextResponse.redirect(new URL(`${accountsCenterBaseUrl}/login`, request.url))
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: '/login/:path*',
}