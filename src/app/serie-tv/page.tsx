import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import HeroMediaCard from "../_components/HeroMediaCard";
import ScrollSection from "../_components/ScrollSection";
import { MediaData } from "../_components/Mediadata";
import { shuffle } from "../shuffle";

export default async function SerieTV() {
  let latestMedia: MediaData[] = [];
  let genreResults: any[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/latest/tv`, {
      cache: "no-store",
    });
    latestMedia = await res.json();


    const genres = [
      { id: 10759, name: "Action & Adventure" },
      { id: 10765, name: "Sci-Fi & Fantasy" },
      { id: 18, name: "Dramma" },
      { id: 80, name: "Crime" },
      { id: 35, name: "Commedia" },
      { id: 9648, name: "Mistero" },
    ];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    genreResults = await Promise.all(
      genres.map(async ({ id, name }) => {
        const resGenres = await fetch(`${baseUrl}/api/contents/latest/tv?genre=${id}`, {
          cache: "no-store",
        });
        const data = await resGenres.json();
        return {
          id,
          name,
          items: shuffle(data),
        };
      })
    );



  } catch (error) {
    console.error("Errore nel fetch:", error);
  }


  return (
    <>
      <NavBar />

      {/* Hero Section con un film random o featured */}
      {latestMedia.length > 0 && (
        <HeroMediaCard mediaID={latestMedia[0].id} type={'tv'} />
      )}
      <hr className="text-[#212121] mb-5 mt-5" />

      {genreResults.map(({ name, items }) => (
        <div key={name}>
          <h1 className="text-2xl font-bold ml-6 mt-10">{name}</h1>
          <ScrollSection media={items} />
        </div>
      ))}

      <Footer />

    </>
  );
}