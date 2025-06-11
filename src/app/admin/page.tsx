// app/admin/page.tsx
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions, SessionData } from "@/app/lib/session";
import { redirect } from "next/navigation";
import LogoutButton from "../_components/LogoutButton";
import Navbar from "../_components/NavBar";
import MediaManager from "../_components/MediaManager";

export default async function AdminPage() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);

  if (!session?.isLoggedIn || !session) {
    redirect("/login");
  }

  return (
    <div>
      <Navbar />
      <div className="m-20 mx-56">
        <div className="flex">
          <h1 className="text-4xl mr-5">Admin Panel - {session.user?.username}</h1>
          <LogoutButton />
        </div>
        <div className="py-10 flex">
          <div className=" bg-zinc-800 w-[15%] h-full p-2 rounded-l-[10px]">
            <ul>
              <li className="p-3 m-2 rounded bg-blue-600"><a href="#">Media Manager</a></li>
              <li className="p-3 bg-zinc-900 m-2 rounded"><a href="#">User Manager</a></li>
            </ul>
          </div>
          <div className="bg-zinc-800">
          </div>
        </div>
      </div>
    </div>
  );
}
