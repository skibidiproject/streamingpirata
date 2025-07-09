"use client";

import LazyLoader from "../_components/LazyLoader";
import NavBar from "../_components/NavBar";
import Loader from "../_components/loader";
import { useEffect, useState } from "react";


interface MediaData {
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


export default function ArchivePage() {
  
  const [Content, setContent] = useState<MediaData[]>([]);

  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents`, {
          cache: "no-store",
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data: MediaData[] = await res.json();
        setContent(data.filter((m) => m.type === "movie"));
      } catch (e) {
        console.error("Errore nel fetch:", e);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Show loader while loading
  if (loading) {
    return (
      <>
        <NavBar />
        <hr className="mt-[5rem] text-[#212121]"/>
        <Loader />
      </>
    );
  }


  if (error) {
    return (
      <>
        <NavBar />
        <hr className="mt-[5rem] text-[#212121]"/>
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-xl mb-2">Errore nel caricamento dei film</p>
            <p className="text-gray-600">Riprova più tardi</p>
          </div>
        </div>
      </>
    );
  }

  console.log(Content)

  return (
    <>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <NavBar />

      <hr className="mt-[5rem] text-[#212121]"/>
      
      <LazyLoader mediaData={Content}/>
    </>
  );
}