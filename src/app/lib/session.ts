import { SessionOptions } from 'iron-session';

export interface SessionData {
  lastRefresh: any;
  user?: {
    id: number;
    telegramId: number;
    firstName: string;
    lastName?: string;
    username?: string;
    photoUrl?: string;
    isAdmin: boolean;
    status: string;
  };
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: 'fuckcopyright_session',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 giorni
    path: '/',
    domain: process.env.SESSION_DOMAIN,
  },
};