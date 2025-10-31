import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { unsealData } from 'iron-session';
import { sessionOptions, SessionData } from '@/app/lib/session';

const ENABLE_AUTH = true;


const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || "";

async function getSession(request: NextRequest): Promise<SessionData | null> {
  const sessionCookie = request.cookies.get(sessionOptions.cookieName)?.value;
  if (!sessionCookie) return null;

  try {
    return await unsealData<SessionData>(sessionCookie, {
      password: sessionOptions.password,
    });
  } catch (err) {
    console.error('Session parse error:', err);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  if (ENABLE_AUTH) {
    const { pathname } = request.nextUrl;

    // Redirect a servizio di autenticazione esterno
    if (pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL(`${AUTH_URL}/login`, request.url));
    }

    if (pathname.startsWith('/logout')) {
      return NextResponse.redirect(new URL(`${AUTH_URL}/logout`, request.url));
    }

    const session = await getSession(request);
    const isLoggedIn = !!session?.isLoggedIn && !!session?.user;

    // Pagina per utenti non approvati
    const waitingApprovalPath = process.env.NEXT_PUBLIC_AUTH_URL + '/status-utenza ';
    const isWaitingPage = pathname === waitingApprovalPath;

    // Se NON loggato → redirect al login
    if (!isLoggedIn && !isWaitingPage) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Se loggato ma NON approvato → vai alla pagina di attesa
    if (isLoggedIn && !(session.user!.status == 'active') && !isWaitingPage) {
      return NextResponse.redirect(new URL(waitingApprovalPath, request.url));
    }

    // Se loggato e approvato ma sta sulla pagina di attesa → redirect alla home
    if (isLoggedIn && session.user!.status == 'active' && isWaitingPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match tutte le richieste tranne:
     * - api (tutte le rotte /api/*)
     * - _next/static (file statici)
     * - _next/image (ottimizzazione immagini)
     * - favicon.ico
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};