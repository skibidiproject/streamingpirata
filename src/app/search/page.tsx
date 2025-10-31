"use client";
import { useState, Suspense } from "react";
import NavBar from "../_components/NavBar";
import LazyLoader from "../_components/LazyLoader";
import FilterBar, { FilterOptions } from "../_components/FIlterBar";
import { useSearchParams } from "next/navigation";

function SearchContent() {
  const [filters, setFilters] = useState<FilterOptions>({});
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  // Handler per i cambiamenti dei filtri
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Costruisci i filtri completi includendo la query di ricerca
  const completeFilters = {
    ...filters,
    ...(query.trim() ? { search: query.trim() } : {})
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <NavBar alwaysTransparent={true}/>

      {/* Barra dei filtri - SEMPRE presente come in archive */}
      <FilterBar
        onFiltersChange={handleFiltersChange}
        showTypeFilter={true}
        initialFilters={filters}
      />

      {/* Mostra query */}
      {query && (
        <div className="px-4 sm:px-6 lg:px-8 pt-10">
          <p className="text-white text-sm">
            Risultati per: <span className="text-white font-medium">&quot;{query}&quot;</span>
          </p>
        </div>
      )}

      {/* Contenuto principale */}
      {!query.trim() ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
          <div className="text-center">
            <p className="text-white text-lg">Inserisci un termine di ricerca</p>
          </div>
        </div>
      ) : (
        <LazyLoader filters={completeFilters} />
      )}
    </div>
  );
}

export default function Search() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white">Caricamento...</div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}