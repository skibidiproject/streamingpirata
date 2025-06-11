"use client"

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import NavBar from "../_components/NavBar";


export default function Home() {

    const searchParams = useSearchParams()
    const query = searchParams.get("q") || ""

  return (
    <>
      <NavBar/>
      <div className="p-12">
      <h1 className="text-2xl">Risultati per "{query}":</h1>
        
      </div>
    </>
  );
}
