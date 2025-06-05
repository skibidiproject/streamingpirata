
import NavBar from "./_components/NavBar";
import HeroMediaCard from "./_components/HeroMediaCard";
import MediaCard from "./_components/MediaCard";


export default function Home() {
  return (
    <>
      <NavBar/>
      <HeroMediaCard mediaID="1"/>

      <h1 className="text-2xl font-bold mt-15 ml-8">Aggiunti di recente</h1>

      <div className="overflow-x-auto overflow-y-hidden">

        <div className="flex flex-row gap-x-5 px-8 pb-4 w-max">
          <MediaCard mediaID="1" />
          <MediaCard mediaID="4" />
          <MediaCard mediaID="5" />
          <MediaCard mediaID="6" />
          <MediaCard mediaID="7" />
          <MediaCard mediaID="8" />
          <MediaCard mediaID="1" />
          <MediaCard mediaID="4" />
          <MediaCard mediaID="5" />
          <MediaCard mediaID="6" />
        </div>
      </div>

    </>
  );
}
