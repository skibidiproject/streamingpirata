import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

interface Params {
  type: string;
  id: string;
  season: string;
  episode: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { type, id, season, episode } = await params;
  
  if (type === "tv") {
    const seasonNum = parseInt(season, 10);
    const episodeNum = parseInt(episode, 10);
    
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
    `, [id, episodeNum, seasonNum]);
    
    const media = result.rows[0];
    return NextResponse.json(media);
  }
  
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}