// app/page.tsx o app/(home)/page.tsx

import NavBar from "./_components/NavBar";
import HeroMediaCard from "./_components/HeroMediaCard";
import Footer from "./_components/Footer";
import ScrollSection from "./_components/ScrollSection";

// Definisci il tipo per i dati dei media
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

export default async function Home() {
  let latestMedia: MediaData[] = [];

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/latest`, {
      cache: "no-store",
    });
    latestMedia = await res.json();
  } catch (error) {
    console.error("Errore nel fetch:", error);
  }

  return (
    <>
      <NavBar />

      <HeroMediaCard mediaID="1" />

      <h1 className="text-2xl font-bold ml-8 mb-4">Aggiunti di recente</h1>

      <ScrollSection media={latestMedia} />

      <Footer />
    </>
  );
}
