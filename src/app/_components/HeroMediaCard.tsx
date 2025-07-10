'use client'

import PlayButton from "./PlayButton";
import TrailerButton from "./TrailerButton";
import ExpandableText from "./ExpandableText";
import YouTubePlayer from "./YoutubePlayer";
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
  type: string;
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

export default function HeroMediaCard({ mediaID, type }: HeroMediaCardProps) {
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [youtubeEmbed, setYoutubeEmbed] = useState<string | null>(null);
  const [isTrailerPlaying, setIsTrailerPlaying] = useState(false);

  useEffect(() => {
    async function getMediaData(mediaId: string, type: string): Promise<MediaData | null> {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${type}/${mediaId}`);
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

      const data = await getMediaData(mediaID, type);

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
        <div className="relative">
          {/* Pulsing dots */}
          <div className="flex space-x-2 justify-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
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
    <div className="transition-all duration-500 ease-in-out relative flex flex-col justify-center gap-y-3 text-4xl w-full py-30 h-full lg:h-[40vw] text-white p-8 mb-1">

      {isTrailerPlaying && (

        <>
        <YouTubePlayer
          videoId={youtubeEmbed}
          onPause={() => setIsTrailerPlaying(false)}
          onPlay={() => console.log('Video playing')}
          onEnded={() => setIsTrailerPlaying(false)}
          onError={(error) => console.error('Player error:', error)}
          onReady={() => console.log('Player ready')}
          className="absolute inset-0 w-screen h-full z-4"
        />

        <div className="absolute w-full h-[7rem] md:h-[5rem] bg-black z-5 inset-0"></div>
        </>
      )}

      {/* Gradient Below */}
      <div className={`absolute inset-0 z-5  pointer-events-none ${isTrailerPlaying ? "md:bg-[linear-gradient(to_top,#0a0a0a_0%,#0a0a0a_5%,transparent_20%)]  bg-[linear-gradient(to_top,#0a0a0a_0%,#0a0a0a_15%,transparent_30%)]" : "bg-[linear-gradient(to_top,#0a0a0a_0%,#0a0a0a_5%,transparent_100%)]"}`}></div>


      {/* Background Image */}
      <img
        src={bgUrl}
        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-500 ${isTrailerPlaying ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"} z-4`}
      />

      

      <div className={`transition-opacity duration-500 ${isTrailerPlaying ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"} z-6`}>

        <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_right,#0a0a0a_0%,#0a0a0a_20%,transparent_100%)]  "></div>


        {mediaData.logo_url ? <img src={mediaData.logo_url} className={`w-[15rem] lg:w-80 mb-5 ml-1 object-contain object-left mt-[5rem]`} /> : <h1 className="mb-5 mt-8">{mediaData.title}</h1>}

        <div className="flex flex-row gap-x-5 text-sm font-bold p-1 flex-wrap gap-y-2 mb-1">
          <h1>{new Date(mediaData.release_date).toLocaleDateString()}</h1>
          <h1>{mediaData.type == "tv" ? <span>Serie TV</span> : <span>Film</span>}</h1>
          {mediaData.certification && (
            <h1
              className={`border px-1 rounded-[5px]
                  ${['VM14', 'VM18', 'R', 'TV-14', 'TV-MA', 'NC-17', '18+', '14+'].includes(mediaData.certification)
                  ? 'bg-red-500 border-red-500 text-white'
                  : ['PG', 'PG-13', 'TV-PG', 'TV-G', 'E10+', 'T', 'M'].includes(mediaData.certification)
                    ? 'bg-yellow-400 border-yellow-400 text-black'
                    : 'border-white text-white bg-transparent'
                }
                `}
              id="yr"
            >
              {mediaData.certification}
            </h1>
          )}
          <h1>{mediaData.genres_array && <span>{mediaData.genres_array.join(', ')}</span>}</h1>

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