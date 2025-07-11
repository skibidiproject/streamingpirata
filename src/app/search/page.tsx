"use client";
import { useEffect, useState } from "react";
import NavBar from "../_components/NavBar";
import Loader from "../_components/loader";
import LazyLoader from "../_components/LazyLoader";
import FilterBar from "../_components/FIlterBar";
import React from "react";
import { MediaData } from "../_components/Mediadata";

export interface FilterOptions {
  year?: string;
  genreId?: string;
  type?: "all" | "movie" | "tv";
  rating?: string;
}



interface Props {
  searchParams: Promise<{ q: string }>;
}

export default function Search({ searchParams }: Props) {
  const [results, setResults] = useState<MediaData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  
  // Use React.use() to unwrap searchParams
  const params = React.use(searchParams);
  const query = (params.q || "").trim();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        // Costruiamo i parametri di ricerca
        const params = new URLSearchParams();
        params.append("search", query);
        
        // Aggiungiamo i filtri se presenti
        if (filters.year) params.append("year", filters.year);
        if (filters.genreId) params.append("genreId", filters.genreId);
        if (filters.type && filters.type !== "all") params.append("type", filters.type);
        if (filters.rating) params.append("rating", filters.rating);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?${params.toString()}`,
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
  }, [query, filters]); // Aggiunto filters come dipendenza

  // Show loader while loading
  if (loading) {
    return (
      <>
        <NavBar />
        <hr className="mt-[5rem] text-[#212121]" />
        <Loader />
      </>
    );
  }

  if (error) {
    return (
      <>
        <NavBar />
        <hr className="mt-[5rem] text-[#212121]" />
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
          <div className="text-center">
            <p className="text-white text-xl mb-2">Errore nel caricamento dei film</p>
            <p className="text-white">{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <NavBar />
      <hr className="mt-[5rem] text-[#212121]" />
      
      {/* Barra dei filtri (mostrata solo se c'è una query) */}
      {query && (
        <FilterBar 
          onFiltersChange={setFilters}
          initialFilters={filters}
        />
      )}
      
      {/* Risultati della ricerca */}
      <LazyLoader mediaData={results} />
    </>
  );
}