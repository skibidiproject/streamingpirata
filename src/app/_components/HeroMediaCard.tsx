import PlayButton from "./PlayButton";
import TrailerButton from "./TrailerButton";
import PegiRating from "./PegiRating";
import { db } from "../lib/database";

interface MediaData {
  Imdb_ID: string;
  Name: string;
  Description: string;
  Cover_url: string;
  Hero_url: string | null;
  Release_year: number;
  Pegi_rating: number;
  Content_type: "film" | "serie";
}

interface HeroMediaCardProps {
  mediaID: string;
}

async function getMediaData(mediaId: string): Promise<MediaData | null> {
  try {
    const connection = await db;
    const [rows] = await connection.execute(
      "SELECT * FROM `content` WHERE Imdb_ID = ? ",
      [mediaId]
    );

    const mediaArray = rows as any[];
    return mediaArray.length > 0 ? mediaArray[0] : null;
  } catch (error) {
    console.error("Database error:", error);
    return null;
  }
}

export default async function HeroMediaCard({ mediaID }: HeroMediaCardProps) {
  const mediaData = await getMediaData(mediaID);

  if (!mediaData) {
    return (
      <div className="flex flex-col justify-center items-center gap-y-3 text-5xl w-full h-[30rem] bg-gray-800 text-white p-8">
        <p className="text-xl">Media not found</p>
      </div>
    );
  }

  const bgUrl = mediaData.Hero_url || " ";

  return (
    <div className="relative flex flex-col justify-center gap-y-3 text-5xl w-full h-[30rem] bg-cover bg-center text-white p-8">
 <img
   src={bgUrl}
   className="absolute inset-0 w-full h-full object-cover object-top -z-10"
 />
 {/* Combined gradients overlay - positioned above image but below text */}
 <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_top,#0a0a0a_0%,#0a0a0a_5%,transparent_100%)]"></div>
 <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_right,#0a0a0a_0%,#0a0a0a_20%,transparent_100%)] "></div>
 <h1>{mediaData.Name}</h1>
 <div className="flex flex-row gap-x-5 text-xl">
   <PegiRating ID={mediaID} />
   <h1>Release year: {mediaData.Release_year}</h1>
   <h1>Type: {mediaData.Content_type}</h1>
   <h1>Rating: {mediaData.Pegi_rating}+</h1>
 </div>
 <h1 className="text-xl font-medium w-[25rem] md:w-[50rem]">
   {mediaData.Description}
 </h1>
 <div className="flex flex-row gap-x-4 text-lg mt-4">
   <PlayButton ID={mediaID} />
   <TrailerButton ID={mediaID} />
 </div>
</div>
  );
}
