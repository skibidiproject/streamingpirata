// app/api/logout/route.ts
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/app/lib/session";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    // Distruggi la sessione
    session.destroy();
    
    return NextResponse.json(
      { message: "Logout effettuato con successo" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Errore durante il logout:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}

// Supporta anche GET per logout tramite link diretto
export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    // Distruggi la sessione
    session.destroy();
    
    // Redirect alla homepage o login page
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL));
    
  } catch (error) {
    console.error("Errore durante il logout:", error);
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_BASE_URL));
  }
}