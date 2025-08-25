// app/(home)/[type]/[id]/page.tsx
import NavBar from "../../../_components/NavBar";
import HeroMediaCard from "../../../_components/HeroMediaCard";
import Footer from "../../../_components/Footer";
import EpisodeSelector from "@/app/_components/EpisodeSelector";
import ScrollSection from "@/app/_components/ScrollSection";
import { notFound } from "next/navigation";

interface MediaPageProps {
  params: { type: string; id: string };
  searchParams: { season?: string };
}

export default async function Media({ params, searchParams }: MediaPageProps) {
  const { id, type } = params;
  const season = searchParams.season ? parseInt(searchParams.season, 10) : undefined;

  let data: any = null;
  let dataCorrelati: any = null;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${type}/${id}`);
    if (!res.ok) notFound();
    data = await res.json();

    const resCorrelati = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/correlati/${type}/${id}`);
    if (resCorrelati.ok) dataCorrelati = await resCorrelati.json();
  } catch (e) {
    console.error(e);
  }

  return (
    <>
      <NavBar />

      <HeroMediaCard mediaID={id} type={type} />

      <section id="episodi">
        {data?.type === "tv" && <EpisodeSelector id={id} season={season} />}
      </section>

      <div>
        <h1 className="text-2xl font-bold ml-6 mt-10">Correlati</h1>
        <ScrollSection media={dataCorrelati} />
      </div>

      <Footer />
    </>
  );
}
