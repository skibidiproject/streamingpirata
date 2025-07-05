"use client"
import { useState } from "react";


export default function PlayButton({ID}: {ID: string} ){

    const filmID = useState(ID)[0];

    const log = () => {
        console.log(filmID)
    }

    return(
        <button onClick={log} className="bg-white hover:shadow-[0_0_10px_4px_rgba(255,255,255,0.3)] transition-all duration-300 rounded-md text-black w-[10rem] h-[2.5rem] font-medium hover:cursor-pointer text-[1em]">▶ Guarda Ora</button>
    )
}