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
  
  return (
    <div className="min-h-screen bg-black">
      <VideoPlayer 
        streamUrl={"http://127.0.0.1:5000/api/v1/vixcloud/manifest?url=https://vixsrc.to/movie/786892/"} 
        title={"CAO"} 
        type={params.type} 
        id={params.tmdbid}
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