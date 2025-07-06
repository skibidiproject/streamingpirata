'use client'
import { useRouter } from "next/navigation";
import ExpandableText from "./ExpandableText";
export default function Episode({ id, season, episode }: {
    id: string,
    season: number,
    episode: number
}) {

    const router = useRouter();

    function playEpisode()
    {
        router.push(`/player/tv/${id}/${season}/${episode}`);
    }

    return (
        <div className="mt-5 py-1 rounded-lg flex items-start gap-4 w-[60%]" >
            <img
                src="https://image.tmdb.org/t/p/original/8TE0ymzucRjNRWiWujEldNhPDiB.jpg"
                className="h-24 object-cover rounded-md cursor-pointer"
                onClick={playEpisode}
            />
            <div>
                <h2 className="text-lg font-semibold hover:underline cursor-pointer" onClick={playEpisode}>Episodio 1</h2>
                <ExpandableText lines={2} text="Il giorno in cui Belly, suo fratello Steven e loro madre Laurel arrivano a Cousin Beach è il primo giorno d'estate Saranno ospiti di Susannah Fisher e dei suoi figli Conrad e Jeremiah. Belly va in vacanza a Cousins da quando è nata ma quest'anno ha la sensazione che sarà diverso, e se la sua prima notte li è un fattore indicativo ci sono tutti i segnali che sarà cosi" />
            </div>
        </div>
    );
}
