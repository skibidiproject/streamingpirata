// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./src/app/lib/session";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    
    if (!session.isLoggedIn) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
}