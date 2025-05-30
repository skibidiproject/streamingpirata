// ============================================
// /api/auth/login/
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "../../../lib/session";
import bcrypt from "bcryptjs";


export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password sono obbligatori" },
        { status: 400 }
      );
    }
    if (username == "admin" && password == "admin") {
      const response = NextResponse.json({
        success: true,
        user: {
          id: 1,
          username: username,
          role: password
        }
      });
      /*
      // Crea sessione 
      
      const session = await getIronSession<SessionData>(request, response, sessionOptions);
      
      session.user = {
        id: user.id,
        username: user.username
      };
      session.isLoggedIn = true;
  
      await session.save();
  
      // Estendi durata cookie se "ricordami" (altrimenti rimane session cookie)
      if (remember) {
        // Imposta cookie con durata specifica solo se "ricordami"
        response.cookies.set(sessionOptions.cookieName!, '', {
          ...sessionOptions.cookieOptions,
          maxAge: 60 * 60 * 24 * 30, // 30 giorni
        });
      }
      
      */
      return response;
    }
    else {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }


  } catch (error) {
    console.error("Errore login:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
