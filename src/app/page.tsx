// app/page.tsx o app/(home)/page.tsx

import NavBar from "./_components/NavBar";
import HeroMediaCard from "./_components/HeroMediaCard";
import Footer from "./_components/Footer";
import ScrollSection from "./_components/ScrollSection";
import { MediaData } from "./_components/Mediadata";



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

      <HeroMediaCard mediaID={latestMedia[0].id} type={latestMedia[0].type} />

      <h1 className="xl:absolute text-2xl font-bold ml-6 xl:mt-[-2rem] z-10">Aggiunti di recente</h1>

      <ScrollSection media={latestMedia} />


      <Footer />
    </>
  );
}
