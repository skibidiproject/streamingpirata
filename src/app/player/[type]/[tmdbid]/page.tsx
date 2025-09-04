import { notFound } from 'next/navigation';
import VideoPlayer from '@/app/_components/VideoPlayer';

interface PageProps {
  params: Promise<{
    type: string;
    tmdbid: string;
    season?: string;
    episode?: string;
  }>;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// Traccia la visualizzazione
async function insertViewRecord({ tmdbid, type }: { tmdbid: string; type: string }) {
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
async function buildExtractionUrl({
  type,
  tmdbid,
  season,
  episode,
}: {
  type: string;
  tmdbid: string;
  season?: string;
  episode?: string;
}): Promise<string | null> {
  const extractorUrl = process.env.EXTRACTOR_BASE_URL;
  const vixUrl = process.env.VIXSRC_BASE_URL;
  const url = `${extractorUrl}/api/v1/vixcloud/manifest?url=${vixUrl}/${type}/${tmdbid}/${season ?? ''}/${episode ?? ''}`;
  return url
}

// Ottiene il titolo del contenuto
async function getTitle({ 
  type, 
  tmdbid, 
  season, 
  episode 
}: { 
  type: string; 
  tmdbid: string; 
  season?: string; 
  episode?: string; 
}): Promise<string> {
  try {
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

// Ottiene il prossimo episodio
async function getNextEpisode({ 
  type, 
  tmdbid, 
  season, 
  episode 
}: { 
  type: string; 
  tmdbid: string; 
  season?: string; 
  episode?: string; 
}) {
  try {
    let url = `${baseUrl}/api/nextepisode/${tmdbid}`;
    if (type === 'tv' && season && episode) {
      url += `/${season}/${episode}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error('Errore nel fetch API');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

// Componente player
async function PlayerContent({ 
  params 
}: { 
  params: {
    type: string;
    tmdbid: string;
    season?: string;
    episode?: string;
  }
}) {
  const streamUrl = await buildExtractionUrl(params);
  console.log(streamUrl);
  if (!streamUrl) {
    notFound();
  }
  await insertViewRecord(params);
  const title = await getTitle(params);
  console.log(await getNextEpisode(params));
  
  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer 
        streamUrl={streamUrl} 
        title={title} 
        type={params.type} 
        id={params.tmdbid} 
        nextEpisode={await getNextEpisode(params)} 
        season={params.season ? parseInt(params.season) : undefined}
      />
    </div>
  );
}

// Componente principale
export default async function PlayerPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <PlayerContent params={resolvedParams} />
  );
}