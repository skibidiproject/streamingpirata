import MediaCard from "../_components/MediaCard";
import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import HeroMediaCard from "../_components/HeroMediaCard";
import ScrollSection from "../_components/ScrollSection";


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
      
      {/* Hero Section con un film random o featured */}
      {films.length > 0 && (
        <HeroMediaCard mediaID={films[0].id} />
      )}

      <h1 className="text-2xl font-bold ml-8 mt-10  mt-[-3rem]">Azione</h1>
      <ScrollSection media={films} />
      <h1 className="text-2xl font-bold ml-8 mt-10  ">Avventura</h1>
      <ScrollSection media={films} />
      <h1 className="text-2xl font-bold ml-8 mt-10  ">Amore</h1>
      <ScrollSection media={films} />
      <h1 className="text-2xl font-bold ml-8 mt-10  ">Drama</h1>
      <ScrollSection media={films} />
      <h1 className="text-2xfilms ml-8 mt-10  ">Thriller</h1>
      <ScrollSection media={films} />

      <Footer />
    </>
  );
}