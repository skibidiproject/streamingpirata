"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"


export default function Search()
{
    const [query, setQuery] = useState("")
    const router = useRouter()

    const handleSearch = () => {
        if(query.trim()){
            router.push(`/search?q=${query}`)
        }
    }


    return(
        <div className="w-[15rem]">

            <input 
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cerca film, serie TV..."
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-[#191919] w-full rounded-md p-1 pl-5 text-[0.9rem] h-[2rem]"
            />

            <button className="absolute translate-x-[-2rem] translate-y-[0.25rem] hover:bg-[#3e3e3e] aspect-square h-[1.5rem] rounded-2xl duration-200" onClick={handleSearch}>O</button>
        </div>
    )
}