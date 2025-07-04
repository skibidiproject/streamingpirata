interface MediaData {
  Imdb_ID: string;
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

export default function MediaCard({ mediaData }: MediaCardProps) {
  // Utilizza i dati passati come prop
  const coverURL = mediaData.Cover_url || " ";

  return (
    <button className="relative overflow-hidden shadow-2xl transition-all duration-300 text-xs flex flex-col text-left justify-end h-[15rem] w-[10rem] rounded-xl mt-8 p-4 group flex-shrink-0 bg-[#090909]">
      <img
        src={coverURL}
        className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-300 scale-110 group-hover:scale-105"
        style={{ clipPath: 'inset(0 round 12px)' }}
        alt={mediaData.Name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent z-[1]"></div>
      <div className="relative z-10 font-bold text-white">
        <h1 className="text-[1rem]">{mediaData.Name}</h1>
        <div className="flex flex-row gap-x-1 items-center">
          <h1>{mediaData.Release_year}</h1>
          <span className="text-gray-400">|</span>
          <h1>{mediaData.Content_type}</h1>
        </div>
      </div>
    </button>
  );
}