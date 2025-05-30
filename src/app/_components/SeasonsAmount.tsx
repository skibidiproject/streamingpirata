"use client"
import { useState } from "react";

export default function SeasonsAmount({ID}: {ID: string})
{
    const filmID = useState(ID)[0];

    return(
        <h1 className="font-medium text-[1em]">Amount of seasons with id: {ID}</h1>
    )
}