"use client"

import { useEffect, useState, useRef } from "react";
import MediaCard from "./MediaCard";
import { FixedSizeGrid as Grid } from "react-window";
import { MediaData } from "./Mediadata";

interface LazyLoaderProps {
    mediaData: MediaData[];
}

interface Genre {
    id: number;
    genre: string;
}

export default function LazyLoader({ mediaData }: LazyLoaderProps) {
    const measureCardRef = useRef<HTMLDivElement>(null);
    const [isReady, setIsReady] = useState(false);
    const [opacity, setOpacity] = useState(0); // Per transizione smooth

    // Dynamic card dimensions
    const [cardWidth, setCardWidth] = useState<number>(200);
    const [cardHeight, setCardHeight] = useState<number>(320);

    // Window state
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const [windowHeight, setWindowHeight] = useState<number>(0);
    const [columnCount, setColumnCount] = useState<number>(1);

    // Responsive spacing configuration
    const getCellGap = (width: number) => {
        if (width < 640) return 12;
        if (width < 1024) return 8;
        return 16;
    };

    const getContainerPadding = (width: number) => {
        if (width < 640) return 8;
        if (width < 1024) return 12;
        return 24;
    };

    const cellGap = getCellGap(windowWidth);
    const containerPadding = getContainerPadding(windowWidth);

    useEffect(() => {
        const measureCard = () => {
            if (mediaData.length > 0 && measureCardRef.current) {
                const rect = measureCardRef.current.getBoundingClientRect();
                setCardWidth(rect.width);
                setCardHeight(rect.height);
                setIsReady(true);
                
                // Transizione smooth
                setTimeout(() => setOpacity(1), 50);
            }
        };

        if (mediaData.length > 0) {
            setIsReady(false);
            setOpacity(0);
            measureCard();

            const timer = setTimeout(measureCard, 100);
            return () => clearTimeout(timer);
        }
    }, [mediaData, windowWidth]);

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;
            const height = window.innerHeight;
            setWindowWidth(width);
            setWindowHeight(height);

            if (mediaData.length > 0 && measureCardRef.current) {
                setOpacity(0); // Fade out durante resize
                setTimeout(() => {
                    if (measureCardRef.current) {
                        const rect = measureCardRef.current.getBoundingClientRect();
                        setCardWidth(rect.width);
                        setCardHeight(rect.height);
                        setIsReady(true);
                        setTimeout(() => setOpacity(1), 50); // Fade in
                    }
                }, 50);
            }
        }

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [mediaData]);

    useEffect(() => {
        if (windowWidth > 0) {
            const availableWidth = windowWidth - (containerPadding * 2);

            if (windowWidth < 640) {
                const minCardWidth = 100;
                const effectiveCardWidth = Math.max(cardWidth, minCardWidth);
                const cols = Math.max(1, Math.floor(availableWidth / (effectiveCardWidth + cellGap)));
                setColumnCount(cols);
            } else {
                const cols = Math.max(1, Math.floor((availableWidth + cellGap) / (cardWidth + cellGap)));
                setColumnCount(cols);
            }
        }
    }, [windowWidth, cardWidth, cellGap, containerPadding]);

    const rowCount = Math.ceil(mediaData.length / columnCount);

    if (mediaData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                <div className="text-center">
                    <p className="text-white text-xl">Nessun film disponibile</p>
                </div>
            </div>
        );
    }

    const Cell = ({
        columnIndex,
        rowIndex,
        style,
    }: {
        columnIndex: number;
        rowIndex: number;
        style: React.CSSProperties;
    }) => {
        const index = rowIndex * columnCount + columnIndex;
        if (index >= mediaData.length) return null;
        const film = mediaData[index];

        return (
            <div
                style={{
                    ...style,
                    padding: `${cellGap / 2}px`,
                }}
            >
                <MediaCard mediaData={film} />
            </div>
        );
    };

    return (
        <>
            {/* Hidden MediaCard for measurement */}
            {mediaData.length > 0 && (
                <div
                    ref={measureCardRef}
                    style={{
                        position: 'absolute',
                        visibility: 'hidden',
                        top: -9999,
                        left: -9999,
                        pointerEvents: 'none'
                    }}
                >
                    <MediaCard mediaData={mediaData[0]} />
                </div>
            )}

            {/* Loading state */}
            {!isReady && mediaData.length > 0 && (
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                        <p className="text-white text-lg">Caricamento...</p>
                    </div>
                </div>
            )}

            {/* Main content with smooth transition */}
            {isReady && (
                <div
                    className="w-full mt-[0rem] transition-opacity duration-300"
                    style={{
                        padding: `0 ${containerPadding}px`,
                        opacity: opacity,
                    }}
                >
                    <div className="flex justify-center w-full">
                        <Grid
                            columnCount={columnCount}
                            columnWidth={cardWidth + cellGap}
                            height={windowHeight - 135}
                            rowCount={rowCount}
                            rowHeight={cardHeight + cellGap}
                            width={Math.min(
                                windowWidth - (containerPadding * 2),
                                columnCount * (cardWidth + cellGap)
                            )}
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                            }}
                            className="hide-scrollbar"
                        >
                            {Cell}
                        </Grid>
                    </div>
                </div>
            )}
        </>
    );
}