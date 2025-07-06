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
    <div className="relative w-full max-w-[15rem] flex-shrink">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cerca film, serie TV..."
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="bg-[#191919] w-full rounded-md p-1 pl-5 text-[0.9rem] h-[2rem] focus:outline-none"
      />
      <button
        className="absolute right-1 top-[0.25rem] hover:bg-[#3e3e3e] aspect-square h-[1.5rem] rounded-2xl duration-200"
        onClick={handleSearch}
      >
        ⌕
      </button>
    </div>
  );
}
