"use client";

import { useRef, useState, useEffect } from "react";
import MediaCard from "./MediaCard";
import Script from "next/script";
import { RedirectType } from "next/navigation";

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
    <div className="relative  w-full px-5">
      


      <div className="md:block hidden">

        <button
          onClick={() => scroll("left")}
          className="
            
            absolute h-full z-10 w-30 
            overflow-hidden
            group
            before:content-['']
            before:absolute before:inset-0
            before:bg-gradient-to-r
            before:from-[#0a0a0a] before:from-20%
            before:to-transparent before:to-100%
            before:opacity-0
            before:transition-opacity before:duration-300
            hover:before:opacity-100 cursor-pointer
          "
        >
          
          <span
            className="
              absolute inset-0
              bg-gradient-to-r from-[#0a0a0a] from-0% to-transparent to-10%
            "
          />

          <h1 className="absolute z-10 left-5 text-2xl font-bold invisible group-hover:visible h-fit "> &lt; </h1>


          
        </button>



        
        <button
          onClick={() => scroll("right")}
          className="
            
            absolute h-full z-10 w-30 
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
          "
        >
          
          <span
            className="
              absolute inset-0
              bg-gradient-to-l from-[#0a0a0a] from-5% to-transparent to-20%
            "
          />

          <h1 className="absolute z-10 right-5 text-2xl font-bold invisible group-hover:visible h-fit "> &gt; </h1>


          
        </button>
        
      </div>






      {/* Container scrollabile */}
      <div
        ref={scrollRef}
        className=" overflow-y-hidden scroll-smooth overflow-x-auto  "
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >

        <div className="flex flex-row gap-x-5 pb-4 whitespace-nowrap  duration-300 ">
          
          {
          
          media.map((m) => (

              <div key={m.id} className="inline-block">

                <MediaCard mediaData={m} />
              </div>
            ) 
          )

          }
        </div>

      </div>


    </div>
  );
}