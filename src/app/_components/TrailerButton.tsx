'use client'
import { useRouter } from "next/navigation"


interface TrailerButtonProps {
    url : string;
    onTrailerToggle: (isPlaying: boolean) => void;
    isPlaying: boolean;
}

export default function TrailerButton({ url, onTrailerToggle, isPlaying}: TrailerButtonProps ) {

    const router = useRouter()

    function play()
    {
        onTrailerToggle(!isPlaying);
    }

    return (
        <button onClick={play} className="bg-[#626262] hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.1)] transition-all duration-300 rounded-md text-white w-[10rem] h-[2.5rem] text-[1em] font-medium hover:cursor-pointer">Trailer</button>
    )
}