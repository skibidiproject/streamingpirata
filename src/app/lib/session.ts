// lib/session.ts
import { SessionOptions } from "iron-session";

export interface SessionData {
  user?: {
    id: string;
    username: string;
  };
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "admin_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    // Nessun maxAge = session cookie (si cancella alla chiusura browser)
  },
};

// Dichiarazione modulo per TypeScript
declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}
