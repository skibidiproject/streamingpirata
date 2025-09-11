"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/solid";

export interface FilterOptions {
  year?: string;
  genreId?: string;
  type?: "all" | "movie" | "tv";
  rating?: string;
  rating_dir?: "gte" | "lte";
  orderby?: string;
  order_dir?: "asc" | "desc";
}

interface Genre {
  id: string;
  genre: string;
}

interface FilterBarProps {
  onFiltersChange: (filters: FilterOptions) => void;
  showTypeFilter?: boolean;
  initialFilters?: FilterOptions;
}

export default function FilterBar({ 
  onFiltersChange, 
  showTypeFilter = true,
  initialFilters = {} 
}: FilterBarProps) {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [genres, setGenres] = useState<Genre[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const ratingRanges = [
    { value: "9", label: "9+", direction: "gte" },
    { value: "8", label: "8+", direction: "gte" },
    { value: "7", label: "7+", direction: "gte" },
    { value: "6", label: "6+", direction: "gte" },
    { value: "5", label: "5+", direction: "gte" },
    { value: "4", label: "4 e sotto", direction: "lte" }
  ];

  const typeOptions = [
    { value: "movie", label: "Film" },
    { value: "tv", label: "Serie TV" }
  ];

  const orderOptions = [
    { value: "az_asc", label: "A-Z" },
    { value: "az_desc", label: "Z-A" },
    { value: "date_desc", label: "Anno (Decrescente)" },
    { value: "date_asc", label: "Anno (Crescente)" },
    { value: "rating_desc", label: "Voto (Decrescente)" },
    { value: "rating_asc", label: "Voto (Crescente)" }
  ];

  const selectClass = `
    w-full pl-3 pr-8 py-2 
    bg-[#171717] border border-[#333] rounded 
    text-white text-sm
    appearance-none
    bg-no-repeat
    bg-[right_0.75rem_center]
    bg-[length:1.2em]
    bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')]
    hover:border-white/25 transition-all
  `;

  // Fetch dati
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [genresRes, yearsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/genres`),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/years`)
        ]);

        if (genresRes.ok) {
          const genresData = await genresRes.json();
          setGenres(genresData);
        }

        if (yearsRes.ok) {
          const yearsData = await yearsRes.json();
          const yearsArray = yearsData
            .map((item: { year: string }) => item.year)
            .sort((a: string, b: string) => parseInt(b) - parseInt(a));
          setYears(yearsArray);
        }
      } catch (error) {
        console.error("Errore caricamento filtri:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Chiudi quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpen]);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = {
      ...filters,
      [key]: value === "" ? undefined : value
    };

    // Gestione speciale per rating
    if (key === 'rating') {
      const ratingOption = ratingRanges.find(r => r.value === value);
      newFilters.rating_dir = ratingOption ? ratingOption.direction as "gte" | "lte" : undefined;
    }

    // Gestione speciale per ordinamento
    if (key === 'orderby') {
      if (value === "") {
        newFilters.orderby = undefined;
        newFilters.order_dir = undefined;
      } else {
        const [orderType, direction] = value.split('_');
        newFilters.orderby = orderType;
        newFilters.order_dir = direction as "asc" | "desc";
      }
    }

    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);
  const getCurrentOrderValue = () => {
    if (filters.orderby && filters.order_dir) {
      return `${filters.orderby}_${filters.order_dir}`;
    }
    return "";
  };

  return (
    <div className="bg-black/80 backdrop-blur-md sticky top-[5.9rem] h-12 z-30 border-b border-[#212121] mb-20">
      <div className="relative">
        <div className="sm:px-8 py-[0.75rem] px-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span className="font-medium">Filtri</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-white rounded-full ml-1"></span>
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Pulisci
              </button>
            )}
          </div>
        </div>

        {/* Pannello filtri con posizionamento assoluto */}
        <div 
          ref={panelRef}
          className={`
            absolute top-full left-0 w-full bg-black/80 backdrop-blur-md 
            transition-all duration-300 overflow-hidden z-40
            ${isOpen 
              ? "max-h-[500px] opacity-100 pointer-events-auto" 
              : "max-h-0 opacity-0 pointer-events-none"
            }
          `}
        >
          <div className="px-4 py-4">
            {loading ? (
              <div className="text-center text-zinc-400 py-4">Caricamento...</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {/* Anno */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Anno</label>
                  <select
                    value={filters.year || ""}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Tutti</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {/* Genere */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Genere</label>
                  <select
                    value={filters.genreId || ""}
                    onChange={(e) => handleFilterChange("genreId", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Tutti</option>
                    {genres.map(genre => (
                      <option key={genre.id} value={genre.id}>{genre.genre}</option>
                    ))}
                  </select>
                </div>

                {/* Tipo */}
                {showTypeFilter && (
                  <div>
                    <label className="block text-sm text-gray-300 mb-1">Tipo</label>
                    <select
                      value={filters.type || ""}
                      onChange={(e) => handleFilterChange("type", e.target.value)}
                      className={selectClass}
                    >
                      <option value="">Tutti</option>
                      {typeOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Rating</label>
                  <select
                    value={filters.rating || ""}
                    onChange={(e) => handleFilterChange("rating", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Tutti</option>
                    {ratingRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Ordinamento */}
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Ordina per</label>
                  <select
                    value={getCurrentOrderValue()}
                    onChange={(e) => handleFilterChange("orderby", e.target.value)}
                    className={selectClass}
                  >
                    <option value="">Default</option>
                    {orderOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}