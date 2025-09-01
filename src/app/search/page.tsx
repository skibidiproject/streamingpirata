"use client";
import { useEffect, useState } from "react";
import NavBar from "../_components/NavBar";
import LazyLoader from "../_components/LazyLoader";
import FilterBar, { FilterOptions } from "../_components/FIlterBar";
import { useSearchParams } from "next/navigation";
import { MediaData } from "../_components/Mediadata";

export default function Search() {
    const [results, setResults] = useState<MediaData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<FilterOptions>({});

    const searchParams = useSearchParams();
    const query = searchParams.get("q") || "";

    // Handler per i cambiamenti dei filtri
    const handleFiltersChange = (newFilters: FilterOptions) => {
        setFilters(newFilters);
    };

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
                const urlParams = new URLSearchParams();
                urlParams.append("search", query);
                
                if (filters.year) urlParams.append("year", filters.year);
                if (filters.genreId) urlParams.append("genreId", filters.genreId);
                if (filters.type && filters.type !== "all") urlParams.append("type", filters.type);
                if (filters.rating) urlParams.append("rating", filters.rating);
                if (filters.rating_dir) urlParams.append("rating_dir", filters.rating_dir);
                if (filters.orderby) urlParams.append("orderby", filters.orderby);
                if (filters.order_dir) urlParams.append("order_dir", filters.order_dir);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?${urlParams.toString()}`,
                    { cache: "no-store" }
                );

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
                    throw new Error(errData.error || "Errore nella ricerca");
                }

                const data = await res.json();
                
                if (data && typeof data === 'object') {
                    if (Array.isArray(data)) {
                        setResults(data);
                    } else if (data.data && Array.isArray(data.data)) {
                        setResults(data.data);
                    } else {
                        console.warn('Formato risposta inaspettato:', data);
                        setResults([]);
                    }
                } else {
                    setResults([]);
                }

            } catch (e) {
                console.error('Errore nella ricerca:', e);
                setError((e as Error).message);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, filters]);

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

            {/* Mostra query e numero risultati */}
            {query && !error && (
                <div className="px-4 sm:px-6 lg:px-8 pt-10">
                    <p className="text-white text-sm">
                        Risultati per: <span className="text-white font-medium">&quot;{query}&quot;</span>
                        {results.length > 0 && (
                            <span className="ml-2">
                                ({results.length} {results.length === 1 ? 'risultato' : 'risultati'})
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Contenuto principale - ora LazyLoader gestisce tutto */}
            {!query ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                    <div className="text-center">
                        <p className="text-white text-lg">Inserisci un termine di ricerca</p>
                    </div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
                    <div className="text-center max-w-md">
                        <h2 className="text-white text-xl mb-3 font-semibold">
                            Errore nella ricerca
                        </h2>
                        <p className="text-white mb-6 text-sm">{error}</p>
                    </div>
                </div>
            ) : loading ? (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="text-gray-400">Caricamento...</div>
                </div>
            ) : (
                <LazyLoader mediaData={results} />
            )}
        </div>
    );
}