"use client";

import LazyLoader from "../_components/LazyLoader";
import NavBar from "../_components/NavBar";
import Loader from "../_components/loader";
import FilterBar, { FilterOptions } from '../_components/FIlterBar';
import { useEffect, useState } from "react";
import { MediaData } from "../_components/Mediadata";



export default function ArchivePage() {
  const [Content, setContent] = useState<MediaData[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});

  // Funzione per costruire la query string dai filtri
  const buildQueryString = (filters: FilterOptions): string => {
    const params = new URLSearchParams();


    // filtri 
    if (filters.year) params.append("year", filters.year);
    if (filters.genreId) params.append("genreId", filters.genreId);
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.rating) params.append("rating", filters.rating);
    if (filters.rating_dir) params.append("rating_dir", filters.rating_dir);
    if (filters.orderby) params.append("orderby", filters.orderby);
    if (filters.order_dir) params.append("order_dir", filters.order_dir);

    return params.toString();
  };

  // Funzione per fare il fetch con i filtri
  const fetchData = async (currentFilters: FilterOptions = {}) => {
    try {
      setLoading(true);
      setError(false);

      const queryString = buildQueryString(currentFilters);
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?${queryString}`;

      const res = await fetch(url, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data: MediaData[] = await res.json();
      setContent(data);
    } catch (e) {
      console.error("Errore nel fetch:", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // Caricamento iniziale
  useEffect(() => {
    fetchData();
  }, []);

  // Handler per i cambiamenti dei filtri
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    fetchData(newFilters);
  };

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
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-500 text-xl mb-2">Errore nel caricamento dei film</p>
            <p className="text-gray-600">Riprova più tardi</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className=" overflow-y-hidden">
        <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        <NavBar />
        <hr className="mt-[5rem] text-[#212121]" />

        {/* Barra dei filtri */}
        <FilterBar
          onFiltersChange={handleFiltersChange}
          showTypeFilter={true} // Nascondo il filtro tipo perché questa pagina è solo per i film
          initialFilters={filters}
        />

        <LazyLoader mediaData={Content} />
      </div>
    </>
  );
}