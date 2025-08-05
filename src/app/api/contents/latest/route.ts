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
    latest_episodes AS (
      SELECT
        ts.media_id,
        MAX(te.release_date) AS max_episode_release_date
      FROM tv_episodes te
      INNER JOIN tv_seasons ts ON ts.id = te.season_id
      WHERE ts.streamable = TRUE
      GROUP BY ts.media_id
    ),
    media_with_release_dates AS (
      SELECT
        m.*,
        COALESCE(ss.max_season_release_date, m.release_date) AS release_date_for_order,
        ss.max_season_release_date,
        le.max_episode_release_date,
        CASE 
          -- Per TV: controlla nuova uscita, nuova stagione, nuovo episodio
          WHEN m.type = 'tv' THEN
            CASE 
              WHEN DATE(m.release_date) >= CURRENT_DATE - INTERVAL '14 days' 
                   AND DATE(m.release_date) <= CURRENT_DATE 
              THEN json_build_object('label', true, 'text', 'Nuova uscita')
              
              WHEN DATE(ss.max_season_release_date) >= CURRENT_DATE - INTERVAL '14 days' 
                   AND DATE(ss.max_season_release_date) <= CURRENT_DATE 
              THEN json_build_object('label', true, 'text', 'Nuova stagione')
              
              WHEN DATE(le.max_episode_release_date) >= CURRENT_DATE - INTERVAL '7 days' 
                   AND DATE(le.max_episode_release_date) <= CURRENT_DATE 
              THEN json_build_object('label', true, 'text', 'Nuovo episodio')
              
              ELSE json_build_object('label', false)
            END
          
          -- Per Movies: solo nuova uscita
          WHEN m.type = 'movie' THEN
            CASE 
              WHEN DATE(m.release_date) >= CURRENT_DATE - INTERVAL '7 days' 
                   AND DATE(m.release_date) <= CURRENT_DATE 
              THEN json_build_object('label', true, 'text', 'Nuova uscita')
              ELSE json_build_object('label', false)
            END
          
          ELSE json_build_object('label', false)
        END AS label_info
      FROM media m
      LEFT JOIN streamable_seasons ss ON (
        ss.media_id = m.id
        AND ss.media_type = m.type
      )
      LEFT JOIN latest_episodes le ON le.media_id = m.id
      WHERE m.streamable = TRUE
      AND (m.type = 'movie' OR ss.media_id IS NOT NULL)
  `;

  if (genreQuery) {
    query += ` AND $1 = ANY(m.genres_ids)`;
    queryParams.push(parseInt(genreQuery));
  }

  query += `
    )
    SELECT 
      m.*,
      release_date_for_order,
      label_info
    FROM media_with_release_dates m
    ORDER BY release_date_for_order DESC
    LIMIT 25;
  `;

  const result = await pool.query(query, queryParams);
  const medias = result.rows;
  
  return NextResponse.json(medias);
}