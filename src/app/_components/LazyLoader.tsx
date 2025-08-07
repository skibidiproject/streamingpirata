"use client"

import { useEffect, useState, useRef, useCallback } from "react";
import MediaCard from "./MediaCard";
import { MediaData } from "./Mediadata";

interface LazyLoaderProps {
    mediaData?: MediaData[];
    filters?: any;
}

interface PaginationResponse {
    data: MediaData[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasMore: boolean;
        itemsOnPage: number;
    };
}

export default function LazyLoader({ mediaData, filters = {} }: LazyLoaderProps) {
    const [items, setItems] = useState<MediaData[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [totalItems, setTotalItems] = useState(0);

    // Numero fisso di elementi per pagina
    const itemsPerPage = 75;

    const abortControllerRef = useRef<AbortController | null>(null);

    // Costruisce i parametri della query
    const buildQueryParams = useCallback((page: number, currentFilters: any = {}) => {
        const params = new URLSearchParams();

        params.append('page', page.toString());
        params.append('limit', itemsPerPage.toString());

        // Aggiungi tutti i filtri
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.append(key, value as string);
            }
        });

        return params.toString();
    }, []);

    // Funzione per fare il fetch
    const fetchData = useCallback(async (page: number, append: boolean = false, currentFilters: any = {}) => {
        try {
            // Cancella la richiesta precedente se esiste
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }

            abortControllerRef.current = new AbortController();

            if (!append) {
                setIsInitialLoading(true);
            }
            setIsLoading(true);
            setError(null);

            const queryString = buildQueryParams(page, currentFilters);
            const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?${queryString}`;

            console.log('Fetching:', url);

            const response = await fetch(url, {
                cache: "no-store",
                signal: abortControllerRef.current.signal,
            });

            if (!response.ok) {
                throw new Error(`Errore del server: ${response.status}`);
            }

            const result: PaginationResponse = await response.json();

            if (append) {
                setItems(prev => [...prev, ...result.data]);
            } else {
                setItems(result.data);
            }

            setHasMore(result.pagination.hasMore);
            setTotalItems(result.pagination.totalItems);
            setCurrentPage(result.pagination.currentPage);

            console.log('Loaded:', result.data.length, 'items. Total:', result.pagination.totalItems);

        } catch (e) {
            if (e instanceof Error && e.name !== 'AbortError') {
                console.error("Errore nel fetch:", e);
                setError(e.message);
            }
        } finally {
            setIsLoading(false);
            setIsInitialLoading(false);
        }
    }, [buildQueryParams]);

    // Caricamento iniziale quando cambiano i filtri
    useEffect(() => {
        if (!mediaData) {
            setItems([]);
            setCurrentPage(1);
            setHasMore(true);
            setError(null);
            fetchData(1, false, filters);
        }
    }, [filters, fetchData, mediaData]);

    // Se mediaData è fornito direttamente (per compatibilità con search)
    useEffect(() => {
        if (mediaData) {
            const dataArray = Array.isArray(mediaData) ? mediaData : [];
            setItems(dataArray);
            setIsInitialLoading(false);
            setHasMore(false);
            setTotalItems(dataArray.length);
            setError(null);
        }
    }, [mediaData]);

    // Funzione per caricare la pagina successiva
    const loadNextPage = useCallback(() => {
        if (hasMore && !isLoading && !mediaData) {
            fetchData(currentPage + 1, true, filters);
        }
    }, [hasMore, isLoading, currentPage, fetchData, filters, mediaData]);

    // Controllo se la pagina è troppo corta per avere scroll
    const checkIfNeedMoreContent = useCallback(() => {
        const docHeight = document.documentElement.scrollHeight;
        const windowHeight = window.innerHeight;
        
        // Se la pagina è più corta della finestra + un po' di margine
        if (docHeight <= windowHeight + 100 && hasMore && !isLoading && !mediaData) {
            console.log('Page too short, loading more content automatically');
            loadNextPage();
        }
    }, [hasMore, isLoading, mediaData, loadNextPage]);

    // Scroll listener per lazy loading
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.offsetHeight;
            
            // Se siamo vicini al fondo (entro 800px)
            if (scrollTop + windowHeight >= docHeight - 800) {
                if (hasMore && !isLoading && !mediaData) {
                    loadNextPage();
                }
            }
        };

        // Aggiungi listener solo se non stiamo usando mediaData direttamente
        if (!mediaData && hasMore) {
            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // Controlla subito se serve più contenuto
            setTimeout(checkIfNeedMoreContent, 500);
            
            return () => window.removeEventListener('scroll', handleScroll);
        }
    }, [hasMore, isLoading, mediaData, loadNextPage, checkIfNeedMoreContent]);

    // Controllo dopo ogni caricamento se serve altro contenuto
    useEffect(() => {
        if (!isLoading && hasMore && items.length > 0) {
            setTimeout(checkIfNeedMoreContent, 300);
        }
    }, [items.length, isLoading, hasMore, checkIfNeedMoreContent]);
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);
    if (isInitialLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="text-center">
                    <div className="flex space-x-1 justify-center items-center mb-4">
                        <div className="h-3 w-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="h-3 w-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="h-3 w-3 bg-white rounded-full animate-bounce"></div>
                    </div>
                    <p className="text-white text-lg">Caricamento...</p>
                </div>
            </div>
        );
    }

    // Errore
    if (error && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
                <div className="text-center max-w-md">
                    <h2 className="text-white text-xl mb-3 font-semibold">
                        Errore nel caricamento
                    </h2>
                    <p className="text-white mb-6 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    // Nessun contenuto
    if (!Array.isArray(items) || (items.length === 0 && !isInitialLoading)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="text-center">
                    <p className="text-white text-xl">Nessun contenuto disponibile</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex justify-center">
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-7">
                {/* Grid responsive */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-3 sm:gap-x-4 lg:gap-x-5 justify-items-center">
                    {Array.isArray(items) && items.map((item, index) => (
                        <MediaCard key={`${item.id}-${index}`} mediaData={item} variant="responsive" />
                    ))}
                </div>

                {/* Elemento osservato per il lazy loading */}
                {hasMore && !mediaData && (
                    <div
                        className="flex justify-center items-center h-20 mt-8"
                    >
                    </div>
                )}

                {/* Messaggio quando tutti gli elementi sono caricati */}
                {!hasMore && items.length > 0 && totalItems > itemsPerPage && (
                    <div className="flex justify-center items-center h-16 mt-4">
                        <div className="text-gray-500 text-sm">
                            Tutti gli elementi disponibili sono stati caricati
                        </div>
                    </div>
                )}
            </div>

            {/* Contatore in tempo reale */}
            {items.length > 0 && totalItems > items.length && (
                <div className="fixed bottom-4 right-4 bg-zinc-900 text-white px-3 py-1 rounded-md text-sm shadow-lg border border-zinc-800">
                    {totalItems} titoli disponibili
                </div>
            )}
        </div>
    );
}