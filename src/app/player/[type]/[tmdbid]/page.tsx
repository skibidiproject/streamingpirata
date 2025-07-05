import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import VideoPlayer from '@/app/_components/VideoPlayer';
import PlayerLoader from '@/app/_components/PlayerLoader';

interface PageProps {
  params: {
    type: string;
    tmdbid: string;
    season?: string;
    episode?: string;
  };
}

interface StreamData {
  success: boolean;
  proxy_url?: string;
  error?: string;
  all_urls?: Array<{
    url: string;
    status: string;
    is_master: boolean;
  }>;
  stats?: {
    total_found: number;
    working: number;
    master_playlists: number;
  };
}

// Costruisce l'URL del player basandosi sui parametri
function buildPlayerUrl(params: PageProps['params']): string | null {
  const { type, tmdbid, season, episode } = params;
  
  if (type === 'movie') {
    return `https://vixsrc.to/movie/${tmdbid}?lang=it`;
  } else if (type === 'tv' && season && episode) {
    return `https://vixsrc.to/tv/${tmdbid}/${season}/${episode}?lang=it`;
  }
  
  return null;
}

// Estrae lo stream dal server (lato server)
async function extractStream(playerUrl: string): Promise<StreamData> {
  const apiUrl = process.env.API_BASE_URL || 'http://localhost:5000';
  
  try {
    const response = await fetch(`${apiUrl}/api/v1/extract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: playerUrl }),
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: StreamData = await response.json();
    
    // Modifica l'URL proxy per essere relativo al nostro dominio
    if (data.proxy_url) {
      const proxyUrl = data.proxy_url.startsWith('http') ?
        data.proxy_url : `${apiUrl}${data.proxy_url}`;
      data.proxy_url = proxyUrl;
    }

    return data;
  } catch (error) {
    console.error('Errore estrazione:', error);
    throw error;
  }
}

// Componente per il contenuto del player
async function PlayerContent({ params }: { params: PageProps['params'] }) {
  const playerUrl = buildPlayerUrl(params);
  
  if (!playerUrl) {
    notFound();
  }

  try {
    const streamData = await extractStream(playerUrl);
    
    if (!streamData.success || !streamData.proxy_url) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-4xl md:text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-xl md:text-2xl mb-2 font-semibold">
              Contenuto non disponibile
            </h2>
            <p className="text-gray-400 text-sm md:text-base">
              {streamData.error || 'Nessun stream trovato per questo contenuto'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-black">
        <VideoPlayer
          streamUrl={streamData.proxy_url}
          title={await getTitle(params)}
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-4xl md:text-6xl mb-4">❌</div>
          <h2 className="text-white text-xl md:text-2xl mb-2 font-semibold">
            Errore di caricamento
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Si è verificato un errore durante il caricamento del contenuto
          </p>
        </div>
      </div>
    );
  }
}

// Componente principale con Suspense
export default function PlayerPage({ params }: PageProps) {
  return (
    <Suspense fallback={<PlayerLoader />}>
      <PlayerContent params={params} />
    </Suspense>
  );
}

// Genera un titolo basato sui parametri
async function getTitle(params: PageProps['params']): Promise<string> {
  const { type, tmdbid, season, episode } = params;
  
  if (type === 'movie') {
    return `Film ${tmdbid}`;
  } else if (type === 'tv' && season && episode) {
    return `Serie TV ${tmdbid} - S${season}E${episode}`;
  }
  
  return 'Contenuto';
}