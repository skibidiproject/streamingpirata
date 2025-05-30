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
      <h1>You searched {query}</h1>
    </>
  );
}
