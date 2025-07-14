"use client";

import { useState, useEffect } from "react";
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@headlessui/react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/solid";
import { Transition } from "@headlessui/react";

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

// Componente riutilizzabile per i dropdown
interface DropdownProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: Array<{ value: string; label: string; }>;
}

const Dropdown = ({ label, value, onChange, placeholder, options }: DropdownProps) => (
  <div className="w-full">
    <label className="block text-sm font-medium text-gray-300 mb-2 md:mb-2">
      {label}
    </label>
    <Listbox value={value} onChange={onChange}>
      <div className="relative">
        <ListboxButton className="
          flex items-center justify-between
          w-full px-3 py-2 md:px-4 md:py-2
          bg-[#171717] border-1 border-[#000000ac] backdrop-blur-[16px] rounded-lg
          text-left text-white text-sm md:text-base
          transition-all
        ">
          <span className="block truncate">
            {value ? options.find(opt => opt.value === value)?.label : placeholder}
          </span>
          <ChevronDownIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400 ml-2" />
        </ListboxButton>

        <ListboxOptions className="
          absolute mt-1 w-full max-h-50
          overflow-auto
          z-[60]
          bg-[#171717]/80 border border-[#00000083] backdrop-blur-[16px] rounded-lg
          shadow-2xl shadow-black/50
          focus:outline-none
        ">
          <ListboxOption
            value=""
            className={({ active }) => `
              relative cursor-pointer py-2 pl-4 pr-4 text-sm md:text-base
              ${active ? 'bg-[#212121] text-white' : 'text-gray-300'}
            `}
          >
            {placeholder}
          </ListboxOption>
          {options.map(option => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className={({ active, selected }) => `
                relative cursor-pointer py-2 pl-4 pr-4 text-sm md:text-base
                ${selected ? 'bg-[#0a0a0a] font-extrabold shadow-md' : ''}
                ${active && !selected ? 'bg-[#212121] text-white' : ''}
              `}
            >
              {option.label}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  </div>
);

export default function FilterBar({ 
  onFiltersChange, 
  showTypeFilter = true,
  initialFilters = {} 
}: FilterBarProps) {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(initialFilters);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Stati per i dati dinamici
  const [genres, setGenres] = useState<Genre[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    { value: "date_desc", label: "Anno di uscita (Decrescente)" },
    { value: "date_asc", label: "Anno di uscita (Crescente)" },
    { value: "rating_desc", label: "Voto (Decrescente)" },
    { value: "rating_asc", label: "Voto (Crescente)" }
  ];

  // Fetch dei dati per i filtri
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch generi
        const genresRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/genres`);
        if (!genresRes.ok) throw new Error("Errore nel fetch dei generi");
        const genresData: Genre[] = await genresRes.json();
        setGenres(genresData);

        // Fetch anni
        const yearsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/years`);
        if (!yearsRes.ok) throw new Error("Errore nel fetch degli anni");
        const yearsData = await yearsRes.json();
        const yearsArray = yearsData.map((item: { year: string }) => item.year).sort((a: string, b: string) => parseInt(b) - parseInt(a));
        setYears(yearsArray);

        setLoading(false);
      } catch (e: any) {
        console.error("Errore nel caricamento dei filtri:", e);
        setError(e.message || "Errore nel caricamento");
        setLoading(false);
      }
    };

    fetchFilterData();
  }, []);

  // Effetto per rilevare se il menu mobile è aperto
  useEffect(() => {
    const checkMobileMenu = () => {
      // Controlla se esiste un elemento del menu mobile visibile
      const mobileMenu = document.querySelector('[class*="fixed inset-0 bg-black"]');
      const isMenuVisible = mobileMenu && !mobileMenu.classList.contains('pointer-events-none');
      setIsMobileMenuOpen(!!isMenuVisible);
    };

    // Controllo iniziale
    checkMobileMenu();

    // Observer per cambiamenti nel DOM
    const observer = new MutationObserver(checkMobileMenu);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['class'] 
    });

    return () => observer.disconnect();
  }, []);

  const handleTempFilterChange = (key: keyof FilterOptions, value: string) => {
    setTempFilters(prev => ({
      ...prev,
      [key]: value === "all" || value === "" ? undefined : value
    }));
  };

  const handleRatingChange = (value: string) => {
    if (value === "") {
      setTempFilters(prev => ({
        ...prev,
        rating: undefined,
        rating_dir: undefined
      }));
      return;
    }

    const ratingOption = ratingRanges.find(r => r.value === value);
    if (ratingOption) {
      setTempFilters(prev => ({
        ...prev,
        rating: value,
        rating_dir: ratingOption.direction as "gte" | "lte"
      }));
    }
  };

  const handleOrderChange = (value: string) => {
    if (value === "") {
      setTempFilters(prev => ({
        ...prev,
        orderby: undefined,
        order_dir: undefined
      }));
      return;
    }

    const [orderType, direction] = value.split('_');
    let orderby = "";
    
    switch (orderType) {
      case "az":
        orderby = "az";
        break;
      case "date":
        orderby = "date";
        break;
      case "rating":
        orderby = "rating";
        break;
    }

    setTempFilters(prev => ({
      ...prev,
      orderby,
      order_dir: direction as "asc" | "desc"
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(tempFilters);
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setTempFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    setIsOpen(false);
  };

  const hasActiveFilters = Object.values(appliedFilters).some(value => value !== undefined);

  // Prepara le opzioni per i dropdown
  const yearOptions = years.map(year => ({ value: year, label: year }));
  const genreOptions = genres.map(genre => ({ value: genre.id, label: genre.genre }));
  const ratingOptions = ratingRanges.map(range => ({ value: range.value, label: range.label }));

  // Ottieni il valore corrente per l'ordinamento
  const getCurrentOrderValue = () => {
    if (tempFilters.orderby && tempFilters.order_dir) {
      return `${tempFilters.orderby}_${tempFilters.order_dir}`;
    }
    return "";
  };

  return (
    <div className={`bg-[#0a0a0a] backdrop-blur-md shadow-2xl sticky top-[5rem] z-30 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}`}>
      <div className="">
        <div className="flex items-center justify-between px-3 md:px-6 py-3 md:py-2">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 md:gap-2 text-white hover:text-gray-300 transition-colors"
            >
              <FunnelIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
              <span className="font-medium text-sm md:text-base">Filtri</span>
              <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                <ChevronDownIcon className="w-3 h-3 md:w-4 md:h-4" />
              </span>
            </button>
            
            {hasActiveFilters && (
              <div className="flex items-center gap-1 md:gap-2">
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full"></span>
                <span className="text-xs md:text-sm text-zinc-400">Filtri attivi</span>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs md:text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Pulisci
            </button>
          )}
        </div>
        <hr className="w-full text-[#212121]"/>

        <Transition
          show={isOpen}
          enter="transition duration-200 ease-out"
          enterFrom="transform scale-y-95 opacity-0 -translate-y-2"
          enterTo="transform scale-y-100 opacity-100 translate-y-0"
          leave="transition duration-150 ease-in"
          leaveFrom="transform scale-y-100 opacity-100 translate-y-0"
          leaveTo="transform scale-y-95 opacity-0 -translate-y-2"
        >
          <div className="
            absolute left-0 right-0 top-full p-1
            shadow-black/50
            z-[45]
            overflow-visible bg-[#0a0a0a]/90 backdrop-blur-md shadow-md
          ">
            <div className="px-3 md:px-4 py-3 md:py-4">
              {error && (
                <div className="text-red-500 text-sm mb-4 text-center">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="text-center text-zinc-400 py-6 md:py-8 text-sm md:text-base">
                  Caricamento filtri...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
                    <Dropdown
                      label="Anno"
                      value={tempFilters.year || ""}
                      onChange={(value) => handleTempFilterChange("year", value)}
                      placeholder="Tutti"
                      options={yearOptions}
                    />
                    
                    <Dropdown
                      label="Genere"
                      value={tempFilters.genreId || ""}
                      onChange={(value) => handleTempFilterChange("genreId", value)}
                      placeholder="Tutti"
                      options={genreOptions}
                    />
                    
                    {showTypeFilter && (
                      <Dropdown
                        label="Tipo"
                        value={tempFilters.type || ""}
                        onChange={(value) => handleTempFilterChange("type", value)}
                        placeholder="Tutti"
                        options={typeOptions}
                      />
                    )}
                    
                    <Dropdown
                      label="Rating"
                      value={tempFilters.rating || ""}
                      onChange={handleRatingChange}
                      placeholder="Tutti"
                      options={ratingOptions}
                    />

                    <Dropdown
                      label="Ordina per"
                      value={getCurrentOrderValue()}
                      onChange={handleOrderChange}
                      placeholder="Default"
                      options={orderOptions}
                    />
                  </div>

                  <div className="flex justify-end gap-2 md:gap-3 mt-4 md:mt-6">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-3 md:px-4 py-1.5 text-xs md:text-sm bg-[#303030] text-white rounded-md transition-all duration-300 cursor-pointer"
                    >
                      Annulla
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-3 md:px-4 py-1.5 text-xs md:text-sm bg-white text-black rounded-md transition-all duration-300 cursor-pointer"
                    >
                      Applica
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );
}