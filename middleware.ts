// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const allowedOrigins = ['https://riccardocinaglia.it', 'localhost:3000'];
    
    if (!origin || !allowedOrigins.includes(origin)) {
      return NextResponse.json(
        { error: 'Forbidden origin' },
        { status: 403 }
      );
    }
  }

  
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*'
};