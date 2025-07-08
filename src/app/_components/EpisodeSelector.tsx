'use client'
import { useState, useEffect } from "react"
import Episode from "./Episode"

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

export default function EpisodeSelector({ id }: { id: string }) {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState<EpisodeComplete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch stagioni
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${id}/seasons`);
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
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/contents/${id}/episodes/${selectedSeason}`);
        if (!res.ok) {
          throw new Error("Errore nel fetch degli episodi");
        }
        const data = await res.json();
        setEpisodes(data);
      } catch (e) {
        console.error(e);
        setError("Errore nel caricamento degli episodi");
      }
    };

    if (selectedSeason) {
      fetchEpisodes();
    }
  }, [id, selectedSeason]);

  if (loading) {
    return <div className="m-10">
      <h1>Caricamento...</h1>
      
      </div>;
  }

  if (error) {
    return <div>Errore: {error}</div>;
  }

  return (
    <>
      <div className="w-[95%] h-full mx-auto p-3 rounded-2xl">
        <h1 className="text-2xl mb-2">Episodi</h1>
        <div className="mb-4">
          <label htmlFor="season-select" className="mr-2">Stagione:</label>
          <select
            id="season-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
            className="border border-[#2e2e2e] rounded px-2 py-1"
          >
            {seasons.map((season) => (
              <option key={season.season_number} value={season.season_number}>
                Stagione {season.season_number}
              </option>
            ))}
          </select>
        </div>

        <div className="episodes-list">
          {episodes.map((episode) => (
            <Episode
              key={episode.episode_number}
              id={id}
              season={selectedSeason}
              episode={episode.episode_number}
              title={episode.title}
              description={episode.description}
              stillUrl={episode.still_url}
            />
          ))}
        </div>
      </div>
    </>
  );
}