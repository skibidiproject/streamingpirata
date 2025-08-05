import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string, id: string }> }
) {
  // Await params before accessing its properties
  const { id, type } = await params;
  
  const result = await pool.query(`
    WITH latest_episodes AS (
      SELECT
        ts.media_id,
        MAX(te.release_date) AS max_episode_release_date
      FROM tv_episodes te
      INNER JOIN tv_seasons ts ON ts.id = te.season_id
      WHERE ts.streamable = TRUE
      GROUP BY ts.media_id
    ),
    latest_seasons AS (
      SELECT
        media_id,
        MAX(release_date) AS max_season_release_date
      FROM tv_seasons
      WHERE streamable = TRUE
      GROUP BY media_id
    )
    SELECT
      m.*,
      ARRAY_AGG(g.genre) AS genres_array,
      CASE 
        -- Per TV: controlla nuova uscita, nuova stagione, nuovo episodio
        WHEN m.type = 'tv' THEN
          CASE 
            WHEN DATE(m.release_date) >= CURRENT_DATE - INTERVAL '14 days' 
                 AND DATE(m.release_date) <= CURRENT_DATE 
            THEN json_build_object('label', true, 'text', 'Nuova uscita')
            
            WHEN DATE(ls.max_season_release_date) >= CURRENT_DATE - INTERVAL '14 days' 
                 AND DATE(ls.max_season_release_date) <= CURRENT_DATE 
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
    FROM
      media m
    LEFT JOIN
      genres g ON g.id = ANY(m.genres_ids)
    LEFT JOIN
      latest_episodes le ON le.media_id = m.id
    LEFT JOIN
      latest_seasons ls ON ls.media_id = m.id
    WHERE
      m.id = $1 AND
      m.type = $2 AND
      m.streamable = TRUE
    GROUP BY
      m.id, m.type, le.max_episode_release_date, ls.max_season_release_date
  `, [id, type]);

  const media = result.rows[0];
  return NextResponse.json(media);
}