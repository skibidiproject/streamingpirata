  "use client";
  
  import { useRouter, useSearchParams } from "next/navigation";
  import { useState, useEffect } from "react";

  export default function Search() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Cambia questa linea - inizializza sempre con stringa vuota
    const [query, setQuery] = useState("");
    
    useEffect(() => {
      const q = searchParams.get("q") || "";
      setQuery(q);
    }, [searchParams]);

    const handleSearch = () => {
      if (query) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }
    };

    return (
      <div className={`relative           lg:min-w-[15rem]  min-w-[12rem] w-[12rem]    ${query.trim() ? "lg:w-[20rem]" : "lg:w-[15rem] w-[12rem]" }           flex flex-row duration-300 `}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cerca film, serie TV..."
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="md:bg-[#0a0a0a]/50 bg-[#0a0a0a]/50 border border-[#2e2e2e] w-full backdrop-blur-[8px] rounded-sm p-1 pl-5 pr-10 text-[0.9rem] h-[2rem] focus:outline-none duration-200 text-white"
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white opacity-40"
          aria-label="Cerca"
        >
          {/* Icona lente */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 4a7 7 0 105.292 12.292l4.353 4.353a1 1 0 001.415-1.415l-4.353-4.353A7 7 0 0011 4z"
            />
          </svg>
        </button>
      </div>
    );
  }