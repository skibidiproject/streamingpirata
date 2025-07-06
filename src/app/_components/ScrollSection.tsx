"use client";

import { useRef, useState, useEffect } from "react";
import MediaCard from "./MediaCard";

interface MediaData {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  backdrop_url: string | null;
  logo_url: string;
  release_date: string;
  certification: string;
  type: "tv" | "movie";
}

export default function ScrollSection({ media }: { media: MediaData[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollButtons);
      return () => scrollElement.removeEventListener("scroll", checkScrollButtons);
    }
  }, [media]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative px-5 w-full ">


      {/* LEFT GRADIENT */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-full w-[150px] z-10"
        style={{
          background: `linear-gradient(to right, #0a0a0a 15%, #00000000  50%)`,
        }}
      ></div>

      {/* RIGHT GRADIENT */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-[150px] z-10"
        style={{
          background: `linear-gradient(to left, #0a0a0a 15%, #00000000  50%)`,
        }}
      ></div>


      {/* Freccia sinistra */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 
                     bg-black/70 hover:bg-black/90 
                     text-white rounded-full p-3 
                     transition-all duration-200 
                     opacity-0 group-hover:opacity-100
                     hover:scale-110 active:scale-95
                     backdrop-blur-sm border border-white/10
                     shadow-lg hover:shadow-xl"
          aria-label="Scorri a sinistra"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="rotate-180"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Freccia destra */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 
                     bg-black/70 hover:bg-black/90 
                     text-white rounded-full p-3 
                     transition-all duration-200 
                     opacity-0 group-hover:opacity-100
                     hover:scale-110 active:scale-95
                     backdrop-blur-sm border border-white/10
                     shadow-lg hover:shadow-xl"
          aria-label="Scorri a destra"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
          >
            <path
              d="M6 12L10 8L6 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      {/* Container scrollabile */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden scrollbar-hide
                   scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="w-full flex flex-row gap-x-5 px-2 pb-4 whitespace-nowrap">
          {media.map((m) => {

            console.log(m)

            return (

              <div key={m.id} className="inline-block">

                <MediaCard mediaData={m} />
              </div>

            )
          })}
        </div>
      </div>


    </div>
  );
}