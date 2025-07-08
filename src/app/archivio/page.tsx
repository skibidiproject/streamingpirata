"use client";
import { FixedSizeGrid as Grid } from "react-window";
import MediaCard from "../_components/MediaCard";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import { useEffect, useState, useRef } from "react";

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

export default function ArchivePage() {
  const ref = useRef<HTMLDivElement>(null);
  const [films, setFilms] = useState<MediaData[]>([]);
  const [error, setError] = useState(false);
  
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
  
  // Ref for measuring MediaCard
  const measureCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/latest`, {
          cache: "no-store",
        });
        const data: MediaData[] = await res.json();
        setFilms(data.filter((m) => m.type === "movie"));
      } catch (e) {
        console.error("Errore nel fetch:", e);
        setError(true);
      }
    }
    fetchData();
  }, []);

  // Measure MediaCard dimensions after films are loaded AND on window resize
  useEffect(() => {
    const measureCard = () => {
      if (films.length > 0 && measureCardRef.current) {
        const rect = measureCardRef.current.getBoundingClientRect();
        setCardWidth(rect.width);
        setCardHeight(rect.height);
      }
    };

    if (films.length > 0) {
      // Measure immediately
      measureCard();

      // Also measure after images load (if MediaCard contains images)
      const timer = setTimeout(measureCard, 100);
      return () => clearTimeout(timer);
    }
  }, [films, windowWidth]); // Add windowWidth as dependency to remeasure on resize

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setWindowWidth(width);
      setWindowHeight(height);
      
      // Force a recalculation of card dimensions after resize
      if (films.length > 0 && measureCardRef.current) {
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
  }, [films]); // Add films as dependency

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

  const rowCount = Math.ceil(films.length / columnCount);

  if (error) return <p className="text-red-500">Errore nel caricamento dei film.</p>;
  if (films.length === 0) return <p className="text-gray-500 mt-10">Nessun film disponibile</p>;

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
    if (index >= films.length) return null;
    const film = films[index];
    
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
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <NavBar />

      <hr className="mt-[5rem] text-[#212121]"/>
      
      {/* Hidden MediaCard for measurement */}
      {films.length > 0 && (
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
          <MediaCard mediaData={films[0]} />
        </div>
      )}

      <div 
        className="w-full"
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