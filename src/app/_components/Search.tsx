"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Suggetions from "./Suggestion";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

export default function Search() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [viewSuggestions, setViewSuggestions] = useState(true);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);

    if (q) {
      setViewSuggestions(false);
    } else {
      setViewSuggestions(true);
    }
  }, [searchParams]);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = () => {
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setViewSuggestions(false);
    }
  };

  return (
    <div className="flex flex-col relative">
      <div className={`relative lg:min-w-[15rem] min-w-[12rem] w-[12rem] ${query.trim() ? "lg:w-[20rem]" : "lg:w-[15rem] w-[12rem]"} flex flex-row duration-300 `}>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setViewSuggestions(true); // Show suggestions when typing
          }}
          placeholder="Cerca film, serie TV..."
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={`md:bg-[#0a0a0a]/50 bg-[#0a0a0a]/50 border transition-all duration-200 border-[#2e2e2e] ${debouncedQuery.trim() && debouncedQuery.length > 2 ? "rounded-bl-none rounded-br-none" : ""} w-full backdrop-blur-[8px] rounded-sm p-1 pl-5 pr-10 text-[0.9rem] h-[2rem] focus:outline-none duration-200 text-white `}
        />
        <button
          onClick={handleSearch}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-white opacity-40"
          aria-label="Cerca"
        >
          <MagnifyingGlassIcon className="w-5" />
        </button>
      </div>
      {
        debouncedQuery.trim() && debouncedQuery.length > 2 && viewSuggestions && <Suggetions query={debouncedQuery} />
      }
    </div>
  );
}