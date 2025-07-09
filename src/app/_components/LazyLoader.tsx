"use client"

import { useEffect, useState, useRef } from "react";
import MediaCard from "./MediaCard";
import { FixedSizeGrid as Grid } from "react-window";

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

interface LazyLoaderProps {
    mediaData: MediaData[];
}


// Loader Component
const Loader = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
            <div className="relative">
                {/* Pulsing dots */}
                <div className="flex space-x-2 justify-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>

            <p className="text-white mt-4 text-lg">Caricamento film...</p>
        </div>
    );
};



export default function LazyLoader({ mediaData }: LazyLoaderProps) {

    const measureCardRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);


    // Dynamic card dimensions
    const [cardWidth, setCardWidth] = useState<number>(200);
    const [cardHeight, setCardHeight] = useState<number>(320);

    // Window state
    const [windowWidth, setWindowWidth] = useState<number>(0);
    const [windowHeight, setWindowHeight] = useState<number>(0);
    const [columnCount, setColumnCount] = useState<number>(1);

    // Responsive spacing configuration
    const getCellGap = (width: number) => {
        if (width < 640) return 12; // Small screens: 12px gap (increased from 4px)
        if (width < 1024) return 8; // Medium screens: 8px gap 
        return 16; // Large screens: 16px gap
    };

    const getContainerPadding = (width: number) => {
        if (width < 640) return 8; // Small screens: 8px padding
        if (width < 1024) return 12; // Medium screens: 12px padding
        return 24; // Large screens: 24px padding
    };


    const cellGap = getCellGap(windowWidth);
    const containerPadding = getContainerPadding(windowWidth);


    useEffect(() => {
        const measureCard = () => {
            if (mediaData.length > 0 && measureCardRef.current) {
                const rect = measureCardRef.current.getBoundingClientRect();
                setCardWidth(rect.width);
                setCardHeight(rect.height);
            }
        };

        if (mediaData.length > 0) {
            // Measure immediately
            measureCard();

            // Also measure after images load (if MediaCard contains images)
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

            // Force a recalculation of card dimensions after resize
            if (mediaData.length > 0 && measureCardRef.current) {
                // Small delay to ensure DOM has updated
                setTimeout(() => {
                    if (measureCardRef.current) {
                        const rect = measureCardRef.current.getBoundingClientRect();
                        setCardWidth(rect.width);
                        setCardHeight(rect.height);
                    }
                }, 50);
            }
        }

        handleResize();

        window.addEventListener("resize", handleResize);


        return () => window.removeEventListener("resize", handleResize);
    }, [mediaData]); // Add films as dependency

    // Separate effect for calculating columns (depends on windowWidth)
    useEffect(() => {
        if (windowWidth > 0) {
            const availableWidth = windowWidth - (containerPadding * 2);

            // More conservative calculation for mobile
            if (windowWidth < 640) {
                // On mobile, ensure cards don't get too small and account for browser chrome
                const minCardWidth = 150; // Minimum card width on mobile
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
            <>
                <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
                    <div className="text-center">
                        <div className="text-gray-400 text-6xl mb-4">🎬</div>
                        <p className="text-gray-500 text-xl">Nessun film disponibile</p>
                    </div>
                </div>
            </>
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
                    padding: `${cellGap / 2}px`, // Half gap on each side
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





      <div 
        className="w-full mt-[0rem]"
        style={{
          padding: `0 ${containerPadding}px`,
        }}
      >
        <div className="flex justify-center w-full">
          <Grid
            columnCount={columnCount}
            columnWidth={cardWidth + cellGap}
            height={windowHeight - 85}
            rowCount={rowCount}
            rowHeight={cardHeight + cellGap}
            width={Math.min(
              windowWidth - (containerPadding * 2),
              columnCount * (cardWidth + cellGap)
            )}
            style={{
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
            className="hide-scrollbar"
          >
            {Cell}
          </Grid>
        </div>
      </div>
    </>
  );

}