'use client'
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import ExpandableText from "./ExpandableText";
import Image from "next/image";
import { PlayIcon } from "@heroicons/react/24/solid";
import { ImageLoader } from 'next/image';

interface EpisodeProps {
  id: string;
  season: number;
  episode: number;
  title: string;
  description: string;
  stillUrl: string;
}

export default function Episode({ id, season, episode, title, description, stillUrl }: EpisodeProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset loading state when stillUrl changes
  useEffect(() => {
    setIsLoading(true);
    setImageLoaded(false);
  }, [stillUrl]);

  const myLoader: ImageLoader = ({ src, width, quality }) => {
    return `${src}?w=${width}&q=${quality || 75}`
  }

  function playEpisode() {
    router.push(`/player/tv/${id}/${season}/${episode}`);
  }

  const imageUrl = stillUrl || "/no_cover.png";

  return (
    <div className="mt-5 py-1 rounded-lg flex items-start gap-4">
      <div
        className="relative w-40 h-24 cursor-pointer rounded-md overflow-hidden flex-shrink-0 bg-[#090909]"
        onClick={playEpisode}
        aria-label={`Play ${title}`}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black rounded-md z-5">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        <Image
          loading="lazy"
          fill
          src={imageUrl}
          loader={myLoader}
          onLoad={() => {
            setIsLoading(false);
            setImageLoaded(true);
          }}
          onError={() => {
            setIsLoading(false);
            setImageLoaded(false);
          }}
          className={`object-cover rounded-md transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          alt={title}
          sizes="160px"
        />

        <div className="absolute inset-0 flex items-center justify-center rounded-md opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-60 rounded-md"></div>
          <PlayIcon className="relative w-10 h-10 text-white" />
        </div>
      </div>
      
      <div className="flex-1">
        <h2 className="text-lg font-semibold line-clamp-1">
          {episode + ". " + title}
        </h2>
        <ExpandableText lines={2} text={description} />
      </div>
    </div>
  );
}