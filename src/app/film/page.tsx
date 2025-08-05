import NavBar from "../_components/NavBar";
import Footer from "../_components/Footer";
import HeroMediaCard from "../_components/HeroMediaCard";
import ScrollSection from "../_components/ScrollSection";
import ScrollSectionTOP from "../_components/ScrollSectionTOP";
import { MediaData } from "../_components/Mediadata";
import { shuffle } from "../shuffle";


export default async function FilmPage() {

  let top10: MediaData[] = [];
  let latestMedia: MediaData[] = [];
  let genreResults: any[] = [];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const res = await fetch(`${baseUrl}/api/contents/latest/movie`, {
      cache: "no-store",
    });
    latestMedia = await res.json();


    // Fetch "TOP 10"
    const resTop = await fetch(`${baseUrl}/api/analytics/top/movie`, {
      cache: "no-store",
    });
    top10 = await resTop.json();

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


    genreResults = await Promise.all(
      genres.map(async ({ id, name }) => {
        const resGenres = await fetch(`${baseUrl}/api/contents/latest/movie?genre=${id}`, {
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
      {top10.length > 0 ? (<HeroMediaCard mediaID={shuffle(top10)[0].id} type={'movie'} />) :
        (latestMedia.length > 0 && <HeroMediaCard mediaID={shuffle(latestMedia)[0].id} type={'movie'} />)
      }

      {/* top 10*/}
      {
        top10.length === 10 && (
          <div>
            <h1 className="text-2xl font-bold ml-6 mt-10">Film più visti questa settimana</h1>
            <ScrollSectionTOP media={top10} />
          </div>)
      }

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