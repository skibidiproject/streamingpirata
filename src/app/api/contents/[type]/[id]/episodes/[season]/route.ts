import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string, season: string, type: string }> }
) {
  const { type, id, season } = await params;
  
  if (type === "tv") {
    const seasonNum = parseInt(season, 10);
    
    const result = await pool.query(`
      SELECT 
        s.media_id,
        s.season_number, 
        e.episode_number, 
        e.title, 
        e.description, 
        e.still_url, 
        s.streamable, 
        e.streamable 
      FROM tv_episodes e 
      INNER JOIN tv_seasons s ON e.season_id = s.id 
      WHERE s.media_id = $1 
        AND s.season_number = $2 
        AND s.streamable = TRUE 
        AND e.streamable = TRUE 
      ORDER BY e.episode_number
    `, [id, seasonNum]);
    
    const media = result.rows;
    return NextResponse.json(media);
  }
  
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}