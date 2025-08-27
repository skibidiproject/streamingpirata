import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: Record<string, string> }) { // Modifica qui
    const type = params.type;
    if (type === "tv") {
        const id = params.id;
        const season = parseInt(params.season, 10); // Assicurati che season sia un numero
        const episode = parseInt(params.episode, 10); // Assicurati che episode sia un numero
        const result = await pool.query(`
            WITH episode AS (
                SELECT ts.media_id, ts.season_number, te.* 
                FROM tv_episodes te 
                INNER JOIN tv_seasons ts ON ts.id = te.season_id
                WHERE media_id = $1 
                    AND episode_number = $2 
                    AND season_number = $3
            )
            SELECT m.title AS media_title, e.* 
            FROM episode e 
            INNER JOIN media m ON e.media_id = m.id;
        `, [id, episode, season]);
        
        const media = result.rows[0];
        return NextResponse.json(media);
    }

    // Aggiungi una gestione del caso in cui 'type' non è 'tv'
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
