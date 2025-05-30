import Image from "next/image";
import NavBar from "./_components/NavBar";
import HeroMediaCard from "./_components/HeroMediaCard";
import MediaCard from "./_components/MediaCard";


export default function Home() {
  return (
    <>
      <NavBar/>
      <HeroMediaCard/>

      <h1 className="text-2xl font-bold mt-15 ml-8">Aggiunti di recente</h1>

      <div className="overflow-x-auto overflow-y-hidden">

        <div className="flex flex-row gap-x-5 px-8 pb-4 w-max">
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
          <MediaCard ID="12312" />
        </div>
      </div>

    </>
  );
}
