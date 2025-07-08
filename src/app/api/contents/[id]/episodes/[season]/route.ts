import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: { id: string, season: number } }) {
    const id = params.id;
    const season = params.season;

    const result = await pool.query('SELECT s.media_id,s.season_number, e.episode_number, e.title, e.description, e.still_url, s.streamable, e.streamable FROM tv_episodes e INNER JOIN tv_seasons s ON e.season_id = s.id WHERE s.media_id = $1 AND s.season_number = $2 AND s.streamable = TRUE AND e.streamable = TRUE ORDER BY e.episode_number', [id, season]);

    const media = result.rows;

    return NextResponse.json(media);
}
