"use client"
import { useState } from "react";

export default function PegiRating({ID}: {ID: string})
{
    const filmID = useState(ID)[0];

    return(
        <h1>PEGI of film with id: {ID}</h1>
    )
}