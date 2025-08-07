"use client";

import LazyLoader from "../_components/LazyLoader";
import NavBar from "../_components/NavBar";
import FilterBar, { FilterOptions } from '../_components/FIlterBar';
import { useState } from "react";

export default function ArchivePage() {
  const [filters, setFilters] = useState<FilterOptions>({});

  // Handler per i cambiamenti dei filtri
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
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
      

      {/* Barra dei filtri */}
      <FilterBar
        onFiltersChange={handleFiltersChange}
        showTypeFilter={true}
        initialFilters={filters}
        
      />
      
      {/* Contenuto principale - ora LazyLoader gestisce tutto */}
      <LazyLoader filters={filters} />
    </div>
  );
}