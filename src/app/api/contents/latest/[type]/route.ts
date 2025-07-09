import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest, {params}: {params: {type: string}}) {

    const type = params.type;

    let result: any

    if(type === "tv")
    {
        result = await pool.query(`SELECT m.* FROM media m INNER JOIN tv_seasons s ON s.media_id = m.id WHERE m.streamable = TRUE AND s.streamable = TRUE AND s.release_date >= CURRENT_DATE - INTERVAL '60 days'`)
    } else if (type === "movie")
    {
        result = await pool.query(`SELECT * FROM media m WHERE m.streamable = TRUE AND m.release_date >= CURRENT_DATE - INTERVAL '60 days'`)
    }


    const medias = result.rows;

    return NextResponse.json(medias);
}

