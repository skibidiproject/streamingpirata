"use client"
import { useState } from "react";

export default function MediaType({ID}: {ID: string})
{
    const filmID = useState(ID)[0];

    return(
        <h1>Type of Media with id: {ID}</h1>
    )
}