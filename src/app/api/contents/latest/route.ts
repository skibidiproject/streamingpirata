import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const genreQuery = searchParams.get("genre")?.trim() || "";
  const queryParams: any[] = [];
  
  let query = `
    WITH streamable_seasons AS (
      SELECT
        media_id,
        media_type,
        MAX(release_date) AS max_season_release_date
      FROM tv_seasons
      WHERE streamable = TRUE
      GROUP BY media_id, media_type
    ),
    media_with_release_dates AS (
      SELECT
        m.*,
        COALESCE(ss.max_season_release_date, m.release_date) AS release_date_for_order
      FROM media m
      LEFT JOIN streamable_seasons ss ON (
        ss.media_id = m.id
        AND ss.media_type = m.type
      )
      WHERE m.streamable = TRUE
        AND (m.type = 'movie' OR ss.media_id IS NOT NULL)
  `;

  if (genreQuery) {
    query += ` AND $1 = ANY(m.genres_ids)`;
    queryParams.push(parseInt(genreQuery));
  }

  query += `
    )
    SELECT *
    FROM media_with_release_dates
    ORDER BY release_date_for_order DESC
    LIMIT 25;
  `;

  const result = await pool.query(query, queryParams);
  const medias = result.rows;
  return NextResponse.json(medias);
}