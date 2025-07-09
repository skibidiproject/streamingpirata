'use client'

import PlayButton from "./PlayButton";
import TrailerButton from "./TrailerButton";
import ExpandableText from "./ExpandableText";
import pool from "../lib/database";
import { useEffect, useState } from "react";

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
  genres_array: Array<string>;
  type: "tv" | "movie";
}

interface HeroMediaCardProps {
  mediaID: string;
}

function getYouTubeVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    }
    
    return null;
  } catch {
    return null;
  }
}

export default function HeroMediaCard({ mediaID }: HeroMediaCardProps) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [youtubeEmbed, setYoutubeEmbed] = useState<string | null>(null);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  useEffect(() => {
    async function getMediaData(mediaId: string): Promise<MediaData | null> {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${mediaId}`);
        if (!res.ok) throw new Error('Errore nel fetch API');
        const data = await res.json();
        return data;
      } catch (error) {
        console.error("Api error: ", error);
        return null;
      }
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);

      const data = await getMediaData(mediaID);

      if (data) {
        setMediaData(data);
        
        // Extract YouTube video ID after data is loaded
        if (data.trailer_url) {
          const videoId = getYouTubeVideoId(data.trailer_url);
          setYoutubeEmbed(videoId);
          console.log("YouTube video ID:", videoId);
        }
      } else {
        setError("Failed to load media data");
      }

      setIsLoading(false);
    }

    fetchData();
  }, [mediaID]);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center gap-y-3 text-5xl w-full h-[30rem] bg-black text-white p-8">
        <p className="text-xl">Loading...</p>
      </div>
    );
  }

  if (error || !mediaData) {
    return (
      <div className="flex flex-col justify-center items-center gap-y-3 text-5xl w-full h-[30rem] bg-black text-white p-8">
        <p className="text-xl">Media not found</p>
      </div>
    );
  }

  const bgUrl = mediaData.backdrop_url || " ";

  return (
    <div className="transition-all duration-500 ease-in-out relative flex flex-col justify-center gap-y-3 text-4xl w-full py-30 h-full md:h-[40vw] text-white p-8">

      {youtubeEmbed && (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeEmbed}?autoplay=1&controls=0&modestbranding=1&rel=0&fs=0&iv_load_policy=3&mute=1`}
          title="YouTube video player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          className={`absolute inset-0 w-full h-full object-cover object-top -z-10 transition-opacity duration-500 ${isTrailerPlaying ? "opacity-100" : "opacity-0"}`}
        />
      )}

      {/* Combined gradients overlay - positioned above image but below text */}
      <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_top,#0a0a0a_0%,#0a0a0a_5%,transparent_100%)]"></div>

      <div className={`transition-opacity duration-500 ${isTrailerPlaying ? "opacity-0" : "opacity-100"}`}>

        <img
          src={bgUrl}
          className="absolute inset-0 w-full h-full object-cover object-top -z-10"
        />
        <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_right,#0a0a0a_0%,#0a0a0a_20%,transparent_100%)]  "></div>

        <img src={mediaData.logo_url} className={`w-[15rem] lg:w-[15vw] mb-3 ml-1 object-contain object-left mt-[5rem] `} />

        <div className="flex flex-row gap-x-5 text-sm font-bold p-1 flex-wrap gap-y-2">
          <h1>{new Date(mediaData.release_date).toLocaleDateString()}</h1>
          <h1>{mediaData.type == "tv" ? <span>Serie TV</span> : <span>Film</span>}</h1>
          <h1>{mediaData.genres_array && <span>{mediaData.genres_array.join(', ')}</span>}</h1>
          {mediaData.certification == "VM14" || mediaData.certification == "VM18" ? <h1 className=" border-1 px-1 rounded-[5px] bg-red-500 border-red-500" id="yr">{mediaData.certification}</h1> : null}
        </div>
        <h1 className="text-sm md:w-[45rem] w-[20rem] ">
          <ExpandableText lines={3} text={mediaData.description} />
        </h1>
        <div className="flex flex-row gap-x-4 text-lg mt-4 ">
          <PlayButton id={mediaID} type={mediaData.type} />
          {mediaData.trailer_url && <TrailerButton url={mediaData.trailer_url} onTrailerToggle={setIsTrailerPlaying} isPlaying={isTrailerPlaying} />}
        </div>

      </div>
    </div>
  );
}