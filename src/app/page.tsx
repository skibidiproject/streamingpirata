import NavBar from "./_components/NavBar";
import Footer from "./_components/Footer";
import HeroMediaCard from "./_components/HeroMediaCard";
import ScrollSection from "./_components/ScrollSection";
import { MediaData } from "./_components/Mediadata";
import { shuffle } from "./shuffle";

type Genre = {
  id: number;
  name: string;
};

type GenreSection = {
  id: number;
  name: string;
  items: MediaData[];
};

export default async function Home() {

  let latestMedia: MediaData[] = [];
  let genreResults: GenreSection[] = [];
  let heroMedia: MediaData | null = null;

  const genres: Genre[] = [
    { id: 28, name: "Azione" },
    { id: 12, name: "Avventura" },
    { id: 10749, name: "Romance" },
    { id: 18, name: "Dramma" },
    { id: 14, name: "Fantasy" },
    { id: 80, name: "Crime" },
    { id: 9648, name: "Mistero" },
    { id: 53, name: "Thriller" },
    { id: 16, name: "Animazione" },
  ];

  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    // Fetch "Nuovi arrivi"
    const resLatest = await fetch(`${baseUrl}/api/contents/latest`, {
      cache: "no-store",
    });
    latestMedia = await resLatest.json();


    // Fetch per ogni genere
    genreResults = await Promise.all(
      genres.map(async ({ id, name }) => {
        try {
          const res = await fetch(`${baseUrl}/api/contents/latest?genre=${id}`, {
            cache: "no-store",
          });
          const data: MediaData[] = await res.json();
          return {
            id,
            name,
            items: shuffle(data), // vedere se randomizzare per estetica
          };
        } catch (err) {
          console.error(`Errore nel fetch del genere ${name}:`, err);
          return {
            id,
            name,
            items: [],
          };
        }
      })
    );

    // Scegli contenuto hero random da "Nuovi arrivi"
    if (latestMedia.length > 0) {
      heroMedia = latestMedia[Math.floor(Math.random() * latestMedia.length)];
    }
  } catch (error) {
    console.error("Errore generale nel fetch:", error);
  }

  return (
    <>
      <NavBar />
      {/*<StartupDialog />*/}

      {/* Hero Section */}
      {heroMedia && (
        <HeroMediaCard mediaID={heroMedia.id} type={heroMedia.type} />
      )}

      

      {/* Nuovi arrivi */}
      <div>
        <h1 className="text-2xl font-bold ml-6 mt-10">Nuovi arrivi</h1>
        <ScrollSection media={latestMedia} />
      </div>


      {/* Sezioni per genere */}
      {genreResults.map(({ id, name, items }) => (
        <div key={id}>
          <h1 className="text-2xl font-bold ml-6 mt-10">{name}</h1>
          <ScrollSection media={items} />
        </div>
      ))}

      <Footer />
    </>
  );
}
