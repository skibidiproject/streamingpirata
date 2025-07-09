'use client'
import { useRouter } from "next/navigation";
import ExpandableText from "./ExpandableText";
import Image from "next/image";

interface EpisodeProps {
    id: string;
    season: number;
    episode: number;
    title: string;
    description: string;
    stillUrl: string;
}

export default function Episode({ id, season, episode, title, description, stillUrl }: EpisodeProps) {
    const router = useRouter();

    function playEpisode() {
        router.push(`/player/tv/${id}/${season}/${episode}`);
    }

    return (
        <div className="mt-5 py-1 rounded-lg flex items-start gap-4">
            <Image
                loading="lazy"
                width={160}
                height={90}
                src={stillUrl}
                className="h-24 object-cover rounded-md cursor-pointer"
                onClick={playEpisode}
                alt={title}
            />
            <div>
                <h2 className="text-lg font-semibold hover:underline cursor-pointer" onClick={playEpisode}>
                    {title}
                </h2>
                <ExpandableText lines={2} text={description} />
            </div>
        </div>
    );
}