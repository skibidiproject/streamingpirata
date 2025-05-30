"use client"
import { useState } from "react";

export default function MediaName({ID}: {ID: string})
{
    const filmID = useState(ID)[0];

    

    return(
        <h1 className="text-[1em]">Name of film with id: {ID}</h1>
    )
}