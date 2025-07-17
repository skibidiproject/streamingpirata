'use client'
import { useState } from 'react';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import { ImageLoader } from 'next/image'
import { MediaData } from './Mediadata';

interface MediaCardProps {
  mediaData: MediaData;
}

import Link from 'next/link';

export default function MediaCard({ mediaData }: MediaCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const coverURL = mediaData.poster_url || " ";

  const myLoader: ImageLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  return (
    <Link
      href={`/media/${mediaData.type}/${mediaData.id}`}
      className="relative overflow-hidden shadow-2xl transition-all duration-300 text-xs flex flex-col text-left justify-end aspect-[9/16] w-[7rem] md:w-[7rem] xl:w-[10rem] rounded-t-md mt-8 group flex-shrink-0 bg-[#090909]"
    >
      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}
      
      <Image
        src={coverURL}
        alt={mediaData.title}
        fill
        loader={myLoader}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 scale-107 group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent "></div>
      <div className="relative text-white m-2">
        <h1 className="text-[0.9rem] text-wrap w-full mb-1 leading-4">{mediaData.title}</h1>
        <div className="flex flex-row gap-x-1 items-center sm:text-[0.7rem] text-[0.5rem]">
          <h1>{new Date(mediaData.release_date).toLocaleDateString('it-IT')}</h1>
          <span className="text-gray-400">|</span>
          <h1>{mediaData.type == "tv" ? <span>Serie TV</span> : <span>Film</span>}</h1>
        </div>
      </div>
    </Link>
  );
}