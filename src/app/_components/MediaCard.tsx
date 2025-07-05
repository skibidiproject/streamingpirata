import { redirect } from 'next/navigation';

interface MediaData {
  ID: string;
  Name: string;
  Description: string;
  Cover_url: string;
  Hero_url: string | null;
  Release_year: number;
  Pegi_rating: string;
  Content_type: "film" | "serie";
}

interface MediaCardProps {
  mediaData: MediaData; // Riceve direttamente i dati
}

import Link from 'next/link';

export default function MediaCard({ mediaData }: MediaCardProps) {
  const coverURL = mediaData.Cover_url || " ";

  return (
    <Link
      href={`/media/${mediaData.ID}`}
      className="relative overflow-hidden shadow-2xl transition-all duration-300 text-xs flex flex-col text-left justify-end h-[15rem] w-[10rem] rounded-t-md mt-8 group flex-shrink-0 bg-[#090909]"
    >
      <img
        src={coverURL}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 scale-107 group-hover:scale-105 "
   
        alt={mediaData.Name}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent"></div>

      <div className="relative font-bold text-white w-[8rem] m-2">


        <h1 className="text-[1rem] text-wrap">{mediaData.Name}</h1>
        <div className="flex flex-row gap-x-1 items-center">
          <h1>{mediaData.Release_year}</h1>
          <span className="text-gray-400">|</span>
          <h1>{mediaData.Content_type}</h1>
        </div>
      </div>
    </Link>
  );
}