'use client'
import { useRouter } from "next/navigation"

export default function TrailerButton({ url }: { url: string }) {

    const router = useRouter()

    function redirect() {
        router.push(url);
    }

    return (
        <button onClick={redirect} className="bg-[#626262] hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.1)] transition-all duration-300 rounded-md text-white w-[10rem] h-[2.5rem] text-[1em] font-medium hover:cursor-pointer">Trailer</button>
    )
}