"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Inizializza query con il valore di "q" in URL, o stringa vuota
  const [query, setQuery] = useState(() => searchParams.get("q") || "");

  // Se vuoi aggiornare query ogni volta che cambia "q" in URL (opzionale)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${query}`);
    }
  };

  return (
    <div className={`relative min-w-[12rem] lg:min-w-[15rem]  flex flex-row duration-300 ${query.trim() ? "md:w-[20rem]" : "lg:w-[15rem] w-[12rem]"}`} >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca film, serie TV..."
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="md:bg-[#0a0a0a]/50 bg-[#0a0a0a]/50 border-1 border-[#2e2e2e] w-full backdrop-blur-[8px] rounded-sm p-1 pl-5 text-[0.9rem] h-[2rem] focus:outline-none duration-200"
      />
      
      <button
        className="cursor-pointer text-[1.4rem] text-[#eeeeee] ml-[-1.5rem] z-10 aspect-square rounded-2xl duration-200"
        onClick={handleSearch}
      >
        ⌕
      </button>
    </div>
  );
}
