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
    const [retryCount, setRetryCount] = useState(0);

    // Ridotto per Raspberry Pi - meno carico per richiesta
    const itemsPerPage = 50;

    const abortControllerRef = useRef<AbortController | null>(null);
    const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const buildQueryParams = useCallback((page: number, currentFilters: any = {}) => {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', itemsPerPage.toString());

        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'all' && value !== '') {
                params.append(key, value as string);
            }
        });

        return params.toString();
    }, []);

    // Funzione di retry con backoff exponenziale
    const retryFetch = useCallback(async (
        page: number, 
        append: boolean, 
        currentFilters: any, 
        attempt: number = 1
    ): Promise<void> => {
        const maxRetries = 3;
        const baseDelay = 1000; // 1 secondo base
        
        try {
            await fetchDataInternal(page, append, currentFilters);
            setRetryCount(0); // Reset su successo
        } catch (error) {
            if (attempt < maxRetries && isMountedRef.current) {
                const delay = baseDelay * Math.pow(2, attempt - 1); // Backoff exponenziale
                console.log(`Retry ${attempt}/${maxRetries} dopo ${delay}ms`);
                
                retryTimeoutRef.current = setTimeout(() => {
                    if (isMountedRef.current) {
                        setRetryCount(attempt);
                        retryFetch(page, append, currentFilters, attempt + 1);
                    }
                }, delay);
            } else {
                // Fallimento definitivo dopo tutti i retry
                if (isMountedRef.current) {
                    setError(`Errore dopo ${maxRetries} tentativi: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
                    setIsLoading(false);
                    setIsInitialLoading(false);
                }
            }
        }
    }, []);

    // Funzione fetch interna ottimizzata per Pi
    const fetchDataInternal = useCallback(async (
        page: number, 
        append: boolean = false, 
        currentFilters: any = {}
    ): Promise<void> => {
        if (!isMountedRef.current) return;

        // Cancella richiesta precedente
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

        console.log(`Fetching (attempt ${retryCount + 1}):`, url);

        // Timeout più lungo per Raspberry Pi
        const timeoutMs = 15000; // 15 secondi invece di 30
        
        const controller = abortControllerRef.current;
        const timeoutId = setTimeout(() => {
            controller.abort();
        }, timeoutMs);

        try {
            const response = await fetch(url, {
                cache: "no-store",
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    // Header per ottimizzare la connessione
                    'Connection': 'keep-alive',
                    'Accept-Encoding': 'gzip, deflate',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const result: PaginationResponse = await response.json();

            if (!isMountedRef.current) return;

            if (append) {
                setItems(prev => {
                    // Evita duplicati
                    const existingIds = new Set(prev.map(item => item.id));
                    const newItems = result.data.filter(item => !existingIds.has(item.id));
                    return [...prev, ...newItems];
                });
            } else {
                setItems(result.data);
            }

            setHasMore(result.pagination.hasMore);
            setTotalItems(result.pagination.totalItems);
            setCurrentPage(result.pagination.currentPage);

            console.log(`Success: Loaded ${result.data.length} items. Total: ${result.pagination.totalItems}`);

        } finally {
            clearTimeout(timeoutId);
            if (isMountedRef.current) {
                setIsLoading(false);
                setIsInitialLoading(false);
            }
        }
    }, [buildQueryParams, retryCount]);

    // Wrapper pubblico che usa retry
    const fetchData = useCallback((page: number, append: boolean = false, currentFilters: any = {}) => {
        retryFetch(page, append, currentFilters);
    }, [retryFetch]);

    // Effect per filtri con debounce più lungo per Pi
    useEffect(() => {
        if (!mediaData) {
            const timeoutId = setTimeout(() => {
                if (isMountedRef.current) {
                    setItems([]);
                    setCurrentPage(1);
                    setHasMore(true);
                    setError(null);
                    setRetryCount(0);
                    fetchData(1, false, filters);
                }
            }, 800); // Debounce più lungo per Pi

            return () => clearTimeout(timeoutId);
        }
    }, [filters, fetchData, mediaData]);

    // Gestione mediaData diretto
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

    // Load next page con throttling più aggressivo per Pi
    const loadNextPage = useCallback(() => {
        if (hasMore && !isLoading && !mediaData && isMountedRef.current) {
            // Throttling più aggressivo per Pi
            const now = Date.now();
            const lastCall = (loadNextPage as any)._lastCall || 0;
            if (now - lastCall < 2000) return; // 2 secondi invece di 1
            
            (loadNextPage as any)._lastCall = now;
            fetchData(currentPage + 1, true, filters);
        }
    }, [hasMore, isLoading, currentPage, fetchData, filters, mediaData]);

    // Check content con meno frequenza per Pi
    const checkIfNeedMoreContent = useCallback(() => {
        if (!isMountedRef.current || isLoading) return;
        
        // Usa setTimeout invece di requestAnimationFrame per ridurre il carico
        setTimeout(() => {
            if (!isMountedRef.current) return;
            
            const docHeight = document.documentElement.scrollHeight;
            const windowHeight = window.innerHeight;
            
            // Margine più grande per ridurre le chiamate
            if (docHeight <= windowHeight + 300 && hasMore && !isLoading && !mediaData) {
                console.log('Page too short, loading more content');
                loadNextPage();
            }
        }, 100);
    }, [hasMore, isLoading, mediaData, loadNextPage]);

    // Scroll listener ottimizzato per Pi
    useEffect(() => {
        if (mediaData || !hasMore) return;

        let lastScrollTime = 0;
        
        const handleScroll = () => {
            const now = Date.now();
            // Throttling più aggressivo per Pi
            if (now - lastScrollTime < 200) return;
            lastScrollTime = now;
            
            if (!isMountedRef.current) return;
            
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const docHeight = document.documentElement.offsetHeight;
            
            // Margine maggiore per ridurre le chiamate
            if (scrollTop + windowHeight >= docHeight - 1000) {
                if (hasMore && !isLoading && !mediaData) {
                    loadNextPage();
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Check iniziale con delay maggiore
        const timeoutId = setTimeout(checkIfNeedMoreContent, 2000);
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [hasMore, isLoading, mediaData, loadNextPage, checkIfNeedMoreContent]);

    // Check dopo load con delay maggiore
    useEffect(() => {
        if (!isLoading && hasMore && items.length > 0 && isMountedRef.current) {
            const timeoutId = setTimeout(checkIfNeedMoreContent, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [items.length, isLoading, hasMore, checkIfNeedMoreContent]);

    // Cleanup
    useEffect(() => {
        isMountedRef.current = true;
        
        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (retryTimeoutRef.current) {
                clearTimeout(retryTimeoutRef.current);
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
                    <p className="text-white text-lg">
                        Caricamento...
                        {retryCount > 0 && (
                            <span className="block text-sm text-gray-400 mt-1">
                                Tentativo {retryCount + 1}/3
                            </span>
                        )}
                    </p>
                </div>
            </div>
        );
    }

    if (error && items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4">
                <div className="text-center max-w-md">
                    <h2 className="text-white text-xl mb-3 font-semibold">
                        Errore nel caricamento
                    </h2>
                    <p className="text-white mb-6 text-sm">{error}</p>
                    <button 
                        onClick={() => {
                            setRetryCount(0);
                            fetchData(1, false, filters);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Caricamento...' : 'Riprova'}
                    </button>
                </div>
            </div>
        );
    }

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
                {/* Griglia con meno colonne per ridurre il carico di rendering */}
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3 sm:gap-x-4 lg:gap-x-5 justify-items-center">
                    {Array.isArray(items) && items.map((item, index) => (
                        <MediaCard key={`${item.id}-${index}`} mediaData={item} variant="responsive" />
                    ))}
                </div>

                {hasMore && !mediaData && (
                    <div className="flex justify-center items-center h-20 mt-8">
                        {isLoading && (
                            <div className="text-center">
                                <div className="flex space-x-1 justify-center mb-2">
                                    <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="h-2 w-2 bg-white rounded-full animate-bounce"></div>
                                </div>
                                {retryCount > 0 && (
                                    <p className="text-white text-xs">
                                        Tentativo {retryCount + 1}/3
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {!hasMore && items.length > 0 && totalItems > itemsPerPage && (
                    <div className="flex justify-center items-center h-16 mt-4">
                        <div className="text-gray-500 text-sm">
                            Tutti gli elementi disponibili sono stati caricati ({totalItems} totali)
                        </div>
                    </div>
                )}
            </div>

            {items.length > 0 && totalItems > items.length && (
                <div className="fixed bottom-4 right-4 bg-zinc-900 text-white px-3 py-1 rounded-md text-sm shadow-lg border border-zinc-800">
                    {items.length}/{totalItems} caricati
                </div>
            )}
        </div>
    );
}