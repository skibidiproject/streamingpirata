import MediaCard from "../_components/MediaCard";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import HeroMediaCard from "../_components/HeroMediaCard";

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

export default async function FilmPage() {
  let latestMedia: MediaData[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/latest`, {
      cache: "no-store",
    });
    latestMedia = await res.json();
  } catch (error) {
    console.error("Errore nel fetch:", error);
  }

  // Filtra solo i film
  const films = latestMedia.filter(media => media.type === "movie");

  return (
    <>
      <NavBar />
      

      <div className="mt-[5rem] flex flex-col items-center p-2 ">
        <h1 className="text-2xl font-bold mb-2">Film</h1>
        
        {films.length === 0 ? (
          <p className="text-gray-500">Nessun film disponibile</p>
        ) : (
          <div className="flex flex-wrap flex-row w-full justify-center gap-x-10">
            {films.map((film) => (
              <MediaCard key={film.id} mediaData={film} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}