"use client"
import { useState } from "react";

export default function ReleaseYear({ID}: {ID: string})
{
    const filmID = useState(ID)[0];

    return(
        <h1 className="text-[1em]">Year of release with id: {ID}</h1>
    )
}