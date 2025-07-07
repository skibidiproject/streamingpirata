import { redirect } from 'next/navigation';
import Image from 'next/image';

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

interface MediaCardProps {
  mediaData: MediaData; // Riceve direttamente i dati
}

import Link from 'next/link';

export default function MediaCard({ mediaData }: MediaCardProps) {
  const coverURL = mediaData.poster_url || " ";

  return (
    <Link
      href={`/media/${mediaData.id}`}
      className= "relative overflow-hidden shadow-2xl transition-all duration-300  text-xs flex flex-col text-left justify-end aspect-[9/16] w-[7rem] xl:w-[10rem] rounded-t-md mt-8 group flex-shrink-0 bg-[#090909]"
    >
      <Image
        src={coverURL}
        alt={mediaData.title}
        fill
        
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 scale-107 group-hover:scale-105 "
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>

      <div className="relative text-white w-[8rem] m-2">


        <h1 className="text-[0.9rem] text-wrap font-bold w-[6rem] sm:w-[10rem]">{mediaData.title}</h1>
        <div className="flex flex-row gap-x-1 items-center">
          <h1>{new Date(mediaData.release_date).toLocaleDateString()}</h1>
          <span className="text-gray-400">|</span>
          <h1>{mediaData.type == "tv" ? <span>Serie TV</span> : <span>Film</span>}</h1>
        </div>
      </div>
    </Link>
  );
}