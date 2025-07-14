import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import HeroMediaCard from "../_components/HeroMediaCard";
import ScrollSection from "../_components/ScrollSection";
import { MediaData } from "../_components/Mediadata";


export default async function FilmPage() {
  let latestMedia: MediaData[] = [];
  let genreResults: any[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/latest/movie`, {
      cache: "no-store",
    });
    latestMedia = await res.json();


    const genres = [
      { id: 28, name: "Azione" },
      { id: 12, name: "Avventura" },
      { id: 10749, name: "Romance" },
      { id: 27, name: "Horror" },
      { id: 14, name: "Fantasy" },
      { id: 878, name: "Fantascienza" },
      { id: 53, name: "Thriller" },
      { id: 16, name: "Animazione" },
    ];

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    genreResults = await Promise.all(
      genres.map(async ({ id, name }) => {
        const resGenres = await fetch(`${baseUrl}/api/contents/latest/movie?genre=${id}`, {
          cache: "no-store",
        });
        const data = await resGenres.json();
        return {
          id,
          name,
          items: data,
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
        <HeroMediaCard mediaID={latestMedia[0].id} type={'movie'} />
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