// app/page.tsx o app/(home)/page.tsx
import NavBar from "../../_components/NavBar";
import HeroMediaCard from "../../_components/HeroMediaCard";
import Footer from "../../_components/Footer";
import EpisodeSelector from "@/app/_components/EpisodeSelector";
import ScrollToAnchor from "@/app/_components/ScrollToAnchor";

interface MediaPageProps {
  params: {
    id: string;
  };
}


export default async function Media({ params }: MediaPageProps) {
  const { id } = params;

  let data: any;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${id}`);

    if (!res.ok) {
      throw new Error("Errore durante fetch api");
    }

    data = await res.json();


  } catch (e) {
    console.error(e);
  }


  return (
    <>
      <NavBar />

      <HeroMediaCard mediaID={id} />

      {data.type == "tv" &&
        <section id="episodi">
          <ScrollToAnchor/>
          <hr className="text-[#212121] mb-5" />
          <EpisodeSelector id={id} />
        </section>

      }


      <Footer />
    </>
  );
}
