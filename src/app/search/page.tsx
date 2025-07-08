'use client' // RISOLVERE PROBLEMA CARICAMENTO USARE USEEFFECT
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
      {/* luciani ti prego sistema sta griglia del cazzo (e pure le quella ) prima che asporto nodejs dal cazzo di pc*/}
      {/* lo scemo in culo di chatgpt dice pure che devi adattare le dimensioni di MediaCard per essere responsive*/ }
      <div className="mt-[5rem] flex flex-col w-full px-6 sm:px-8">
        {error ? (
          <h1 className="text-2xl mb-4">{error}</h1>
        ) : (
          <>
            <h1 className="text-2xl mb-1">Risultati per "{query}":</h1>
            {results.length === 0 ? (
              <p className="text-gray-500">Nessun risultato trovato.</p>
            ) : (
              <div className="flex flex-wrap flex-row w-full justify-start gap-x-4 sm:gap-x-4">
                {results.map((r) => (
                  <MediaCard key={r.id} mediaData={r} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
