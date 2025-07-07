import NavBar from "../_components/NavBar";
import MediaCard from "../_components/MediaCard";

interface Media {
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

interface Props {
  searchParams: { q?: string };
}

export default async function Home({ searchParams }: Props) {
  const query = searchParams.q || "";

  if (!query) {
    return (
      <>
        <NavBar />
        <div className="p-12">
          <h1 className="text-2xl mb-4">Nessun risultato da mostrare.</h1>
        </div>
      </>
    );
  }

  let results: Media[] = [];
  let error: string | null = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/contents?search=${query}`,
      { cache: "no-store" }
    );
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || "Errore nella fetch");
    }
    results = await res.json();
  } catch (e) {
    error = (e as Error).message;
  }


  return (
    <>
      <NavBar />
      <div className="p-12 mt-12">

        {error && <h1 className="text-2xl mb-4">{error}</h1>}

        {!error && <h1 className="text-2xl mb-2">Risultati per "{query}":</h1>}
        {!error && results.length === 0 && <p>Nessun risultato trovato.</p>}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-9 gap-2">
          {results.map((r) => (
            <MediaCard key={r.id} mediaData={r} />
          ))}
        </div>
      </div>
    </>
  );
}
