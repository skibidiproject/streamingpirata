"use client";

import { useEffect, useState } from "react";
import NavBar from "../_components/NavBar";
import MediaCard from "../_components/MediaCard";

interface Media {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string | null;
  logo_url: string;
  trailer_url: string;
  release_date: string;
  certification: string;
  type: "tv" | "movie";
}

interface Props {
  searchParams: { q?: string };
}

export default function Home({ searchParams }: Props) {
  const [results, setResults] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const query = searchParams.q || "";

  useEffect(() => {
    if (!query) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?search=${query}`,
          { cache: "no-store" }
        );
        
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Errore nella fetch");
        }
        
        const data = await res.json();
        setResults(data);
      } catch (e) {
        setError((e as Error).message);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (!query) {
    return (
      <>
        <NavBar />
        <div className="p-12">
          <h1 className="text-2xl mb-4">Nessun risultato da mostrare.</h1>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <div className="mt-[5rem] flex flex-col w-full px-6 sm:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-lg">Caricamento...</p>
          </div>
        ) : error ? (
          <h1 className="text-2xl mb-4">{error}</h1>
        ) : (
          <>
            <h1 className="text-2xl mb-1">Risultati per "{query}":</h1>
            {results.length === 0 ? (
              <p className="text-gray-500">Nessun risultato trovato.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
                {results.map((r) => (
                  <MediaCard key={r.id} mediaData={r} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}