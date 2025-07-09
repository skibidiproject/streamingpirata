// app/page.tsx o app/(home)/page.tsx
import NavBar from "../../../_components/NavBar";
import HeroMediaCard from "../../../_components/HeroMediaCard";
import Footer from "../../../_components/Footer";
import EpisodeSelector from "@/app/_components/EpisodeSelector";

interface MediaPageProps {
  params: {
    type: string;
    id: string;
  };
}


export default async function Media({ params }: MediaPageProps) {
  const id = params.id;
  const type = params.type;

  let data: any;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${type}/${id}`);

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

      <HeroMediaCard mediaID={id} type={type}/>

      <section id="episodi"></section>
      {data.type == "tv" &&
        <div>
          <hr className="text-[#212121] mb-5" />
          <EpisodeSelector id={id} />
        </div>
      }


      <Footer />
    </>
  );
}
