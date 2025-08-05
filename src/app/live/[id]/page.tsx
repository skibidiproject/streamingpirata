import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import LivePlayer from '@/app/_components/LivePlayer';

interface PageProps {
  params: Promise<{
    id: string
  }>;
}


// Componente per il contenuto del player
export default async function PlayerContent({ params }:  PageProps) {

  const {id} = await params;

  const baseUrl = process.env.MEDIAFLOW_BASE_URL;
  const streamUrl = `http://localhost:8081/dd${id}/index.m3u8`;
  return (
    <div className="min-h-screen bg-black">
      <LivePlayer
        streamUrl={streamUrl}
        title={"Sky CRACKATO"}
      />
    </div>
  );

}