import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest, { params }: { params: { type: string } }) {
  const type = params.type;
  const { searchParams } = new URL(request.url);
  const genreQuery = searchParams.get("genre")?.trim() || "";

  const queryParams: any[] = [];
  let result: any;

  if (type === "tv") {
    let query = `
      SELECT m.* 
      FROM media m 
      INNER JOIN tv_seasons s ON s.media_id = m.id 
      WHERE m.streamable = TRUE 
        AND s.streamable = TRUE 
        AND s.release_date >= CURRENT_DATE - INTERVAL '60 days'
    `;

    if (genreQuery) {
      query += ` AND $1 = ANY(m.genres_ids)`;
      // query += ` ORDER BY m.rating DESC`;
      queryParams.push(parseInt(genreQuery));
    } 
    /*
    else {
      query += ` ORDER BY m.rating DESC`;
    }
    */

    result = await pool.query(query, queryParams);
  } else if (type === "movie") {
    let query = `
      SELECT * 
      FROM media m 
      WHERE m.streamable = TRUE 
        AND m.release_date >= CURRENT_DATE - INTERVAL '60 days'
    `;

    if (genreQuery) {
      query += ` AND $1 = ANY(m.genres_ids)`;
      // query += ` ORDER BY m.rating DESC`;
      queryParams.push(parseInt(genreQuery));
    } 
    /*
    else {
      query += ` ORDER BY m.rating DESC`;
    }
    */

    result = await pool.query(query, queryParams);
  }

  const medias = result.rows;
  return NextResponse.json(medias);
}
