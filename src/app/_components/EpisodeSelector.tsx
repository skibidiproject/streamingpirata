'use client'
import { useState, useEffect } from "react"
import Episode from "./Episode"
import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from '@headlessui/react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

interface Season {
  id: string;
  media_id: string;
  season_number: number;
  description: string;
  number_of_episodes: number;
}

interface EpisodeComplete {
  media_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description: string;
  still_url: string;
}

export default function EpisodeSelector({ id, season }: { id: string, season?: number }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<EpisodeComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stagioni
  useEffect(() => {

    if (season) {
      setSelectedSeason(season);
    }

    const fetchSeasons = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/tv/${id}/seasons`);
        if (!res.ok) {
          throw new Error("Errore nel fetch delle stagioni");
        }
        const data = await res.json();
        setSeasons(data);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setError("Errore nel caricamento delle stagioni");
        setLoading(false);
      }
    };

    fetchSeasons();
  }, [id]);

  // Fetch episodi quando cambia la stagione 
  useEffect(() => {
    const fetchEpisodes = async () => {
      setEpisodesLoading(true);
      setEpisodes([]); // Reset episodes immediately

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/tv/${id}/episodes/${selectedSeason}`);
        if (!res.ok) {
          throw new Error("Errore nel fetch degli episodi");
        }
        const data = await res.json();
        setEpisodes(data);
      } catch (e) {
        console.error(e);
        setError("Errore nel caricamento degli episodi");
      } finally {
        setEpisodesLoading(false);
      }
    };

    if (selectedSeason !== null && selectedSeason !== undefined) {
      fetchEpisodes();
    }
  }, [id, selectedSeason, season]);

  const LoadingDots = () => (
    <div className="flex space-x-2 justify-center py-5">
      <div className="h-3 w-3 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-3 w-3 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-3 w-3 bg-white rounded-full animate-bounce"></div>
    </div>
  );

  if (loading) {
    return (
      <div className="m-10">
        <div className="relative">
          <LoadingDots />
        </div>
      </div>
    );
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  return (
    <>
      <div className="border-b-1 border-b-[#212121]">
        <div className="w-[95%] h-full mx-auto p-3 rounded-2xl py-15">
          <h1 className="text-2xl mb-2">Episodi</h1>
          <div className="mb-6 flex items-center gap-3" >
            <span className="text-white">Stagione:</span>
            <Listbox value={selectedSeason} onChange={setSelectedSeason}>
              <div className="relative">
                <ListboxButton className="
                flex items-center justify-between
                w-35 px-4 py-1 focus:outline-none
                bg-[#171717] border-1 border-[#272727ac] backdrop-blur-[16px] rounded-lg
                text-left text-white
                transition-all
              ">
                  <span className="block truncate">
                    {selectedSeason == 0 ? 'Episodi Speciali' : `Stagione ${selectedSeason}`}
                  </span>
                  <ChevronDownIcon
                    className="w-5 h-5 text-gray-400"
                    aria-hidden="true"
                  />
                </ListboxButton>

                <ListboxOptions className="
                absolute mt-1 w-48 max-h-60
                bg-[#202020] border border-[#272727ac] backdrop-blur-[16px] rounded-lg
          shadow-2xl shadow-black/50
                overflow-auto
                z-10
                
                focus:outline-none
              ">
                  {seasons.map((season) => (
                    <ListboxOption
                      key={season.id}
                      value={season.season_number}
                      className={({ active, selected }) => `
              relative cursor-pointer py-1 pl-4 pr-4
              ${selected ? 'bg-[#0a0a0a]  font-extrabold shadow-md' : ''}
              ${active && !selected ? 'bg-[#212121] text-white' : ''}
              transition-colors
            `}
                    >
                      {({ selected }) => (
                        <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                          {season.season_number == 0 ? 'Episodi Speciali' : `Stagione ${season.season_number}`}
                        </span>
                      )}
                    </ListboxOption>
                  ))}
                </ListboxOptions>
              </div>
            </Listbox>
          </div>

          <div className="episodes-list">
            {episodesLoading ? (
              <div className="py-8">
                <LoadingDots />
              </div>
            ) : (
              episodes.map((episode) => (
                <Episode
                  key={episode.episode_number}
                  id={id}
                  season={selectedSeason}
                  episode={episode.episode_number}
                  title={episode.title}
                  description={episode.description}
                  stillUrl={episode.still_url}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}