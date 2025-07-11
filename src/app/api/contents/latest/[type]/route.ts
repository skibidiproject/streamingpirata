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
      SELECT
        m.*,
        MAX(s.release_date) AS latest_season_date
      FROM
        media m
      INNER JOIN
        tv_seasons s ON s.media_id = m.id
      WHERE
        m.streamable = TRUE
        AND s.streamable = TRUE
        AND m.type = 'tv'
    `;

    if (genreQuery) {
      query += ` AND $1 = ANY(m.genres_ids)`;
      queryParams.push(parseInt(genreQuery));
    }

    query += `
      GROUP BY
        m.id, m.title, m.description, m.release_date, m.type, m.genres_ids, m.rating
      ORDER BY
        latest_season_date DESC, m.rating DESC
      LIMIT 50
    `;

    result = await pool.query(query, queryParams);
  } else if (type === "movie") {
    let query = `
      SELECT *
      FROM media m
      WHERE m.streamable = TRUE
        AND m.type = 'movie'
    `;

    if (genreQuery) {
      query += ` AND $1 = ANY(m.genres_ids)`;
      queryParams.push(parseInt(genreQuery));
    }

    query += ` ORDER BY m.release_date DESC, m.rating DESC LIMIT 50`;
    result = await pool.query(query, queryParams);
  }

  const medias = result.rows;
  return NextResponse.json(medias);
}