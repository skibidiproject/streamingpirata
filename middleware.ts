import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/app/lib/session";

export async function middleware(request:NextRequest) {
    // Protezione per /admin
    if(request.nextUrl.pathname.startsWith('/admin'))
    {
        try
        {
            const response = NextResponse.next();
            const session = request.cookies.get("user_session");

            if(!session)
            {
                return NextResponse.redirect(new URL("/login", request.url));
            }

            return response;
        }catch(error)
        {
            console.log("Errore nel middleware - /admin protection")
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
    else
    {
        return NextResponse.next();
    }
    
}

export const config = {
  matcher: ["/admin/:path*"],
};

// NON VA UN CAZZO COSI 

/*
Il middleware non serve sempre. È molto meglio proteggere /admin così:
/src/app/admin/page.tsx SU COMPONENT SERVER 


SE DEVE ESSERE CLIENT, DIVIDERE LA PARTE CLIENT E LA PARTE SERVER IN DUE COMPONENTI DIVISE

import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/app/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getIronSession(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    redirect("/login");
  }

  return <div>Area Admin Riservata</div>;
}

Questo approccio:

    Funziona perfettamente con iron-session

    Evita i limiti del middleware

    È sicuro perché eseguito lato server
*/