import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string, season: number, episode: number }> }) {
    const { id, season, episode } = await params;

    const result = await pool.query(`SELECT 
            ts.media_id AS id,
            ts.season_number AS season,
            te.episode_number AS episode
        FROM tv_episodes te 
        INNER JOIN tv_seasons ts ON te.season_id = ts.id 
        WHERE ts.media_id = $1 AND ts.media_type = 'tv'
        AND (
            -- Prossimo episodio nella stessa stagione
            (ts.season_number = $2 AND te.episode_number = $3 + 1)
            OR
            -- Primo episodio della stagione successiva (se non c'è più episodi nella stagione corrente)
            (ts.season_number = $2 + 1 AND te.episode_number = 1
             AND NOT EXISTS (
                 SELECT 1 FROM tv_episodes te2 
                 INNER JOIN tv_seasons ts2 ON te2.season_id = ts2.id
                 WHERE ts2.media_id = $1
                 AND ts2.season_number = $2 
                 AND te2.episode_number = $3 + 1
             ))
        )
        ORDER BY ts.season_number, te.episode_number
        LIMIT 1`, [id, season, episode])


    const data = result.rows[0];

    return new NextResponse(JSON.stringify(data));
}