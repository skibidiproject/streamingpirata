import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const {type} = await params;
  const { searchParams } = new URL(request.url);
  const genreQuery = searchParams.get("genre")?.trim() || "";
  const queryParams: any[] = [];
  let result: any;

  if (type === "tv") {
    let query = `
      SELECT
        m.*,
        MAX(s.release_date) AS latest_season_date,
        MAX(e.release_date) AS latest_episode_date,
        CASE 
          WHEN DATE(m.release_date) >= CURRENT_DATE - INTERVAL '14 days' 
               AND DATE(m.release_date) <= CURRENT_DATE 
          THEN json_build_object('label', true, 'text', 'Nuova uscita')
          
          WHEN DATE(MAX(s.release_date)) >= CURRENT_DATE - INTERVAL '14 days' 
               AND DATE(MAX(s.release_date)) <= CURRENT_DATE 
          THEN json_build_object('label', true, 'text', 'Nuova stagione')
          
          WHEN DATE(MAX(e.release_date)) >= CURRENT_DATE - INTERVAL '7 days' 
               AND DATE(MAX(e.release_date)) <= CURRENT_DATE 
          THEN json_build_object('label', true, 'text', 'Nuovo episodio')
          
          ELSE json_build_object('label', false)
        END AS label_info
      FROM
        media m
      INNER JOIN
        tv_seasons s ON s.media_id = m.id
      LEFT JOIN
        tv_episodes e ON e.season_id = s.id
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
      LIMIT 25
    `;

    result = await pool.query(query, queryParams);

  } else if (type === "movie") {
    let query = `
      SELECT *,
        CASE 
          WHEN DATE(release_date) >= CURRENT_DATE - INTERVAL '7 days' 
               AND DATE(release_date) <= CURRENT_DATE 
          THEN json_build_object('label', true, 'text', 'Nuova uscita')
          ELSE json_build_object('label', false)
        END AS label_info
      FROM media m
      WHERE m.streamable = TRUE
      AND m.type = 'movie'
    `;

    if (genreQuery) {
      query += ` AND $1 = ANY(m.genres_ids)`;
      queryParams.push(parseInt(genreQuery));
    }

    query += ` ORDER BY m.release_date DESC, m.rating DESC LIMIT 25`;

    result = await pool.query(query, queryParams);
  }

  // Mantieni tutti i campi originali più le info delle label
  const medias = result.rows;
  return NextResponse.json(medias);
}