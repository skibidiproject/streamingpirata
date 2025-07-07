import PlayButton from "./PlayButton";
import TrailerButton from "./TrailerButton";
import ExpandableText from "./ExpandableText";
import pool from "../lib/database";

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

interface HeroMediaCardProps {
  mediaID: string;
}

async function getMediaData(mediaId: string): Promise<MediaData | null> {
  try {
    // CHIAMARE API /content/id AL POSTO DI INTERROGARE DB
    const result = await pool.query(
      "SELECT * FROM media WHERE id = $1",
      [mediaId]
    );

    const mediaArray = result.rows;
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
      <div className="flex flex-col justify-center items-center gap-y-3 text-5xl w-full h-[30rem] bg-black text-white p-8">
        <p className="text-xl">Media not found</p>
      </div>
    );
  }

  const bgUrl = mediaData.backdrop_url || " ";

  return (
    <div className="transition-all duration-500 ease-in-out relative flex flex-col justify-center gap-y-3 text-4xl w-full py-30 h-full md:h-[40vw] text-white p-8">
      <img
        src={bgUrl}
        className="absolute inset-0 w-full h-full object-cover object-top -z-10"
      />

      {/* Combined gradients overlay - positioned above image but below text */}
      <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_top,#0a0a0a_0%,#0a0a0a_5%,transparent_100%)]"></div>

      <div className="absolute inset-0 -z-[5] bg-[linear-gradient(to_right,#0a0a0a_0%,#0a0a0a_20%,transparent_100%)]  "></div>

      <img src={mediaData.logo_url} className="w-[15rem] lg:w-[15vw] mb-3 ml-1 object-contain object-left mt-[5rem]"/>

      <div className="flex flex-row gap-x-5 text-sm font-bold p-1">
        <h1>{new Date(mediaData.release_date).toLocaleDateString()}</h1>
        <h1>{mediaData.type == "tv" ? <span>Serie TV</span> : <span>Film</span>}</h1>
        {mediaData.certification == "VM14" || mediaData.certification == "VM18" ? <h1 className=" border-1 px-1 rounded-[5px] bg-red-500 border-red-500" id="yr">{mediaData.certification}</h1> : null}
      </div>
      <h1 className="text-sm md:w-[45rem] w-[20rem] ">
          <ExpandableText lines={3} text={mediaData.description}/>
      </h1>
      <div className="flex flex-row gap-x-4 text-lg mt-4 ">
        <PlayButton id={mediaID} type={mediaData.type}/>
        <TrailerButton url={mediaData.trailer_url}/>
      </div>
    </div>
  );
}
