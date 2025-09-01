'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ImageLoader } from 'next/image'
import { MediaData } from './Mediadata';
import Link from 'next/link';

interface MediaCardProps {
  mediaData: MediaData;
  variant?: 'responsive' | 'fixed'; // Nuova prop per gestire il tipo di layout
}

export default function MediaCard({ mediaData, variant = 'responsive' }: MediaCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const coverURL = mediaData.poster_url || " ";

  const myLoader: ImageLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  // Reset image loaded state when mediaData changes
  useEffect(() => {
    setImageLoaded(false);
    setIsLoading(true);
  }, [mediaData.id]);

  // Classi base comuni
  const baseClasses = "relative overflow-hidden shadow-2xl transition-all duration-300 text-xs flex flex-col text-left justify-end aspect-[9/16] rounded-t-md mt-8 group bg-[#090909] hover:shadow-3xl hover:-translate-y-1";

  // Classi specifiche per ogni variante
  const variantClasses = {
    responsive: "w-full flex-shrink-0", // Per LazyLoader - occupa tutto lo spazio della cella grid
    fixed: "w-32 sm:w-36 md:w-40 lg:w-44 xl:w-48 flex-shrink-0" // Per ScrollSection - dimensioni fisse
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]}`;

  return (
    <Link
      href={`/media/${mediaData.type}/${mediaData.id}`}
      className={combinedClasses}
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white"></div>
        </div>
      )}

      <Image
        src={coverURL}
        alt={mediaData.title}
        fill
        sizes={variant === 'responsive'
          ? "(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
          : "(max-width: 640px) 128px, (max-width: 768px) 144px, (max-width: 1024px) 160px, (max-width: 1280px) 176px, 192px"
        }
        loader={myLoader}
        onLoad={() => {
          setIsLoading(false);
          setImageLoaded(true);
        }}
        onError={() => {
          setIsLoading(false);
          setImageLoaded(false);
        }}
        quality={45}
        className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-500 scale-107 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Label */}
      {mediaData.label_info && mediaData.label_info.label && (
        <div className="absolute top-2 left-1 sm:top-2 sm:left-1.5 z-5">
          <span className="bg-blue-600 text-white text-[0.8rem] sm:text-[0.8rem] font-bold rounded px-1 py-1 sm:px-2 sm:py-1 shadow-md">
            {mediaData.label_info.text}
          </span>
        </div>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>

      {/* Content */}
      <div className={`relative text-white m-1.5 sm:m-2 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-[0.8rem] sm:text-[0.8rem] lg:text-[0.9rem] text-wrap w-full mb-1 leading-4 sm:leading-4 font-medium">
          {mediaData.title}
        </h1>
        <div className="flex flex-row gap-x-1 items-center text-[0.6rem] sm:text-[0.55rem] lg:text-[0.65rem] text-gray-300">
          <span>{new Date(mediaData.release_date).toLocaleDateString('it-IT')}</span>
          <span className="text-gray-500">|</span>
          <span>{mediaData.type === "tv" ? "Serie TV" : "Film"}</span>
        </div>
      </div>
    </Link>
  );
}