// app/admin/page.tsx
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/app/lib/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session?.isLoggedIn || !session) {
    redirect("/login");
  }

  return <div>Area Admin Riservata</div>;
}
