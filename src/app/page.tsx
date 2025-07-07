// app/page.tsx o app/(home)/page.tsx

import NavBar from "./_components/NavBar";
import HeroMediaCard from "./_components/HeroMediaCard";
import Footer from "./_components/Footer";
import ScrollSection from "./_components/ScrollSection";


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

      <link rel="shortcut icon" href="logo.png" type="image/x-icon" />
      <NavBar />

      <HeroMediaCard mediaID="872585" />

      <h1 className="text-2xl font-bold ml-8 mt-10 xl:mt-[-3vw] ">Aggiunti di recente</h1>

      <ScrollSection media={latestMedia} />


      <Footer />
    </>
  );
}
