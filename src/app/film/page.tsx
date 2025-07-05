import MediaCard from "../_components/MediaCard";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import HeroMediaCard from "../_components/HeroMediaCard";

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
  const films = latestMedia.filter(media => media.Content_type === "film");

  return (
    <>
      <NavBar />
      
      {/* Hero Section con un film random o featured */}
      {films.length > 0 && (
        <HeroMediaCard mediaID={films[0].ID} />
      )}

      <div className="mx-8 lg:mx-12 mt-5">
        <h1 className="text-2xl font-bold mb-2 mt-">Film</h1>
        
        {films.length === 0 ? (
          <p className="text-gray-500">Nessun film disponibile</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
            {films.map((film) => (
              <MediaCard key={film.ID} mediaData={film} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}