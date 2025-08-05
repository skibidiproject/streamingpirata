"use client";

import { useRef, useState, useEffect } from "react";
import MediaCard from "./MediaCard";
import { MediaData } from "./Mediadata";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

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
      const scrollAmount = direction === "left" ? -640 : 640;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="relative w-full px-5">
      <div className="md:block hidden">
        <button
          onClick={() => scroll("left")}
          className={`
            ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            absolute h-full z-15 w-20 
            overflow-hidden
            group
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-r
            before:from-[#0a0a0a] before:from-20%
            before:to-transparent before:to-100%
            before:opacity-0
            before:transition-opacity before:duration-300
            hover:before:opacity-100 
            cursor-pointer
            transition-opacity duration-700 ease-in-out
          `}
        >
          <span
            className="
              absolute inset-0
              bg-gradient-to-r from-[#0a0a0a] from-0% to-transparent to-10%
            "
          />
          <h1 className="absolute z-15 left-5 text-2xl font-bold invisible group-hover:visible h-fit ">
            <ChevronLeftIcon className="w-8 text-white" />
          </h1>
        </button>

        <button
          onClick={() => scroll("right")}
          className={`
            ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            absolute h-full z-15 w-20 
            overflow-hidden
            group right-4
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-l
            before:from-[#0a0a0a] before:from-20%
            before:to-transparent before:to-100%
            before:opacity-0
            before:transition-opacity before:duration-300
            hover:before:opacity-100 
            cursor-pointer
            transition-opacity duration-700 ease-in-out
          `}
        >
          <span
            className="
              absolute inset-0
              bg-gradient-to-l from-[#0a0a0a] from-5% to-transparent to-20%
            "
          />
          <h1 className="absolute z-15 right-5 text-2xl font-bold invisible group-hover:visible h-fit ">
            <ChevronRightIcon className="w-8 text-white" />
          </h1>
        </button>
      </div>

      {/* Container scrollabile */}
      <div
        ref={scrollRef}
        className="overflow-y-hidden scroll-smooth overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-row md:gap-x-24 gap-x-16 pb-4 whitespace-nowrap mx-1 duration-300 md:ml-8 md:mr-8 ml-5 mr-5">
          {media.map((m, index) => (
            <div key={m.type + m.id} className="inline-block relative">
              {/* Numerone gigante posizionato a sinistra sovrapposto */}
              <div className="absolute left-0 md:top-20 top-15 z-10 -translate-x-3/7">
                <span
                  className="md:text-[10rem] text-[7rem] font-extrabold text-black leading-none"
                  style={{
                    textShadow: '4px 4px 12px rgba(0,0,0,0.7)',
                    WebkitTextStroke: '1px #C7C7C7',
                    background: 'transparent',
                    WebkitBackgroundClip: index < 3 ? 'text' : 'initial',
                    backgroundClip: index < 3 ? 'text' : 'initial',
                    WebkitTextFillColor: index < 3 ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {index + 1}
                </span>
              </div>

              {/* Media Card */}
              <MediaCard mediaData={m} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}