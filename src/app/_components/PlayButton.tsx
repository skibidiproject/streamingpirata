"use client"
import { useRouter } from "next/navigation";
import { Button } from "@headlessui/react";

export default function PlayButton({id, type}: {id: string, type: string} ){

    const router = useRouter();

    const play = () => {
        if(type == "movie")
        {
            router.push(`/player/movie/${id}`)
        }
        else
        {
            router.push(`/media/${type}/${id}#episodi`)
        }
    }

    return(
        <Button onClick={play} className="bg-white hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.3)] transition-all duration-300 rounded-md text-black w-[10rem] h-[2.5rem] font-medium hover:cursor-pointer text-[1em]">▶ Guarda Ora</Button>
    )
}