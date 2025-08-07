import { NextRequest } from "next/server"
import pool from "@/app/lib/database"

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  
  if (type != 'tv' && type != 'movie') {
    return new Response(JSON.stringify({ message: "Type non supportato" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  } else {
    let query: string;
    
    if (type === 'tv') {
      query = `
        WITH data_recente AS (
          SELECT MAX(timestamp_) AS max_timestamp
          FROM analytics_history
        ),
        settimana AS (
          SELECT ah.*
          FROM analytics_history ah, data_recente dr
          WHERE ah.timestamp_ >= dr.max_timestamp - INTERVAL '7 days'
          AND ah.media_type = $1
        ),
        conteggi AS (
          SELECT
            media_id,
            media_type,
            COUNT(*) AS views
          FROM settimana
          GROUP BY media_id, media_type
        )
        SELECT
          c.views,
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
        FROM conteggi c
        LEFT JOIN media m ON c.media_id = m.id AND c.media_type = m.type
        INNER JOIN tv_seasons s ON s.media_id = m.id
        LEFT JOIN tv_episodes e ON e.season_id = s.id
        WHERE m.streamable = TRUE
        AND s.streamable = TRUE
        GROUP BY c.views, m.id, m.title, m.description, m.release_date, m.type, m.genres_ids, m.rating
        ORDER BY c.views DESC
        LIMIT 10
      `;
    } else {
      query = `
        WITH data_recente AS (
          SELECT MAX(timestamp_) AS max_timestamp
          FROM analytics_history
        ),
        settimana AS (
          SELECT ah.*
          FROM analytics_history ah, data_recente dr
          WHERE ah.timestamp_ >= dr.max_timestamp - INTERVAL '7 days'
          AND ah.media_type = $1
        ),
        conteggi AS (
          SELECT
            media_id,
            media_type,
            COUNT(*) AS views
          FROM settimana
          GROUP BY media_id, media_type
        )
        SELECT
          c.views,
          m.*,
          CASE
            WHEN DATE(m.release_date) >= CURRENT_DATE - INTERVAL '7 days'
            AND DATE(m.release_date) <= CURRENT_DATE
            THEN json_build_object('label', true, 'text', 'Nuova uscita')
            ELSE json_build_object('label', false)
          END AS label_info
        FROM conteggi c
        LEFT JOIN media m ON c.media_id = m.id AND c.media_type = m.type
        WHERE m.streamable = TRUE
        ORDER BY c.views DESC
        LIMIT 10
      `;
    }
    
    const data = await pool.query(query, [type]);
    
    return new Response(JSON.stringify(data.rows), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
}