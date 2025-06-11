// ============================================
// /api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "../../../lib/session";
import bcrypt from "bcryptjs";
import { db } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Validazione input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username e password sono obbligatori" },
        { status: 400 }
      );
    }

    // Query per trovare l'utente nel database
    const result = await (await db).execute(
      "SELECT id, username, password FROM admin WHERE username = ?",
      [username]
    );

    const rows = result[0] as any[];

    // Verifica se l'utente esiste
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    const user = rows[0];

    // Verifica la password usando bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Credenziali non valide" },
        { status: 401 }
      );
    }

    // Crea la risposta di successo
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username      }
    });

    const session = await getIronSession<SessionData>(request, response, sessionOptions);
    session.user = {
      id: user.id,
      username: user.username
    };
    session.isLoggedIn = true;
    await session.save();

    return response;

  } catch (error) {
    console.error("Errore login:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}