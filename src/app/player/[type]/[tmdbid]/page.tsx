import { notFound } from 'next/navigation';
import VideoPlayer from '@/app/_components/VideoPlayer';

interface PageProps {
  params: {
    type: string;
    tmdbid: string;
    season?: number;
    episode?: number;
  };
}

// Traccia la visualizzazione
async function insertViewRecord({ tmdbid, type }: PageProps['params']) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${baseUrl}/api/analytics`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: tmdbid, type }),
  });

  if (!response.ok) {
    console.error(`Errore registrazione visualizzazione: ${response.status}`);
  }
}

// Ottiene lo stream
async function extractStream({
  type,
  tmdbid,
  season,
  episode,
}: PageProps['params']): Promise<string | null> {
  const url = `https://devtunnel.riccardocinaglia.it/api/stream/${type}/${tmdbid}/${season ?? ''}/${episode ?? ''}`;
  console.log(url);
  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    redirect: 'follow',
  });

  if (!response.ok) {
    console.error(`Errore nel recupero dello stream: ${response.status}`);
    return null;
  }

  const data = await response.json(); // supponiamo che il backend restituisca `{ streamUrl: string }`
  return data.url ?? null;
}

// Ottiene il titolo del contenuto
async function getTitle({ type, tmdbid, season, episode }: PageProps['params']): Promise<string> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    let url = `${baseUrl}/api/contents/${type}/${tmdbid}`;
    if (type === 'tv' && season && episode) {
      url += `/episode/${season}/${episode}`;
    }

    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore nel fetch API');

    const data = await res.json();

    if (type === 'movie') {
      return data.title || `Film ${tmdbid}`;
    } else if (type === 'tv' && season && episode) {
      return `${data.media_title || `Serie TV ${tmdbid}`} - ${data.title} (S${season}E${episode})`;
    }
  } catch (err) {
    console.error(err);
  }

  return `Streaming ${tmdbid}`;
}

// Componente player
async function PlayerContent({ params }: { params: PageProps['params'] }) {
  const streamUrl = await extractStream(params);
  console.log(streamUrl);
  if (!streamUrl) {
    notFound();
  }

  await insertViewRecord(params);
  const title = await getTitle(params);

  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer streamUrl={streamUrl} type={params.type} id={params.tmdbid} title={title} />
    </div>
  );
}

// Componente principale
export default function PlayerPage({ params }: PageProps) {
  return (
      <PlayerContent params={params} />
  );
}
