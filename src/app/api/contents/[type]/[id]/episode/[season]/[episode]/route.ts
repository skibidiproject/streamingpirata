import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: { id: string, season: number, type: string, episode: number } }) {
    const type = params.type;
    if (type === "tv") {
        const id = params.id;
        const season = params.season;
        const episode = params.episode
        const result = await pool.query(`WITH episode AS (
SELECT ts.media_id, ts.season_number, te.* FROM tv_episodes te INNER JOIN tv_seasons ts ON ts.id = te.season_id
	WHERE media_id = $1 
		AND episode_number = $2
		AND season_number = $3 ) 
SELECT m.title AS media_title, e.* FROM episode e INNER JOIN media m ON e.media_id = m.id;`, [id, episode, season]);
        const media = result.rows[0];

        return NextResponse.json(media);
    }
}
