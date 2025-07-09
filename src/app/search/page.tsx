"use client";
import { useEffect, useState } from "react";
import NavBar from "../_components/NavBar";
import Loader from "../_components/loader";
import LazyLoader from "../_components/LazyLoader";
import React from "react";

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
  searchParams: Promise<{ q: string }>;
}

export default function Home({ searchParams }: Props) {
  const [results, setResults] = useState<Media[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Use React.use() to unwrap searchParams
  const params = React.use(searchParams);
  const query = (params.q || "").trim();

  function normalizeSearchString(s: string): string {
    return s
      .toLowerCase()
      .replace(/[.,\-]/g, ' ') // sostituisce con spazio invece di rimuovere
      .trim()
      .replace(/\s+/g, ' '); // spazi multipli in singolo spazio
  }

  const queryNormalized = normalizeSearchString(query);

  useEffect(() => {
    if (!queryNormalized) {
      setResults([]);
      setError(null);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?search=${encodeURIComponent(queryNormalized)}`,
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
  }, [queryNormalized]); // Changed dependency to queryNormalized

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
      <LazyLoader mediaData={results} />
    </>
  );
}