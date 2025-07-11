import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const mediaId = parseInt(params.id);
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");

  try {
    // Strategia migliorata: più selettiva sui generi e considera il rating target
    const improvedQuery = `
      WITH target_media AS (
        SELECT genres_ids, type, rating, release_date, title
        FROM media
        WHERE id = $1 AND streamable = TRUE AND rating IS NOT NULL
      ),
      genre_matches AS (
        SELECT
          m.*,
          tm.rating as target_rating,
          tm.release_date as target_release_date,
          -- Calcola quanti generi condivide con il target
          (
            SELECT COUNT(*)
            FROM unnest(m.genres_ids) AS genre_id
            WHERE genre_id = ANY(tm.genres_ids)
          ) AS shared_genres_count,
          -- Percentuale di generi condivisi rispetto al target
          (
            SELECT COUNT(*)
            FROM unnest(m.genres_ids) AS genre_id
            WHERE genre_id = ANY(tm.genres_ids)
          )::float / GREATEST(1, array_length(tm.genres_ids, 1))::float AS genre_similarity,
          -- Similarità di rating (più vicini = meglio)
          (1.0 - ABS(COALESCE(m.rating, 0) - tm.rating) / 10.0) AS rating_similarity,
          -- Similarità temporale (stesso periodo = meglio)
          (1.0 - LEAST(1.0, ABS(EXTRACT(YEAR FROM m.release_date) - EXTRACT(YEAR FROM tm.release_date)) / 10.0)) AS temporal_similarity,
          -- Score composito migliorato
          (
            -- Peso per generi condivisi (50% - più importante)
            (SELECT COUNT(*) FROM unnest(m.genres_ids) AS genre_id WHERE genre_id = ANY(tm.genres_ids))::float /
            GREATEST(1, array_length(tm.genres_ids, 1))::float * 0.5 +
            -- Peso per similarità rating (30% - rating simili)
            (1.0 - ABS(COALESCE(m.rating, 0) - tm.rating) / 10.0) * 0.3 +
            -- Peso per recency/epoca (20% - stesso periodo)
            (1.0 - LEAST(1.0, ABS(EXTRACT(YEAR FROM m.release_date) - EXTRACT(YEAR FROM tm.release_date)) / 10.0)) * 0.2
          ) AS similarity_score
        FROM media m
        CROSS JOIN target_media tm
        WHERE m.id != $1
          AND m.streamable = TRUE
          AND m.type = tm.type
          AND m.rating IS NOT NULL
          AND EXISTS (
            SELECT 1 FROM unnest(m.genres_ids) AS genre_id
            WHERE genre_id = ANY(tm.genres_ids)
          )
          -- Filtro per rating simili (+-2 punti di differenza massima)
          AND ABS(COALESCE(m.rating, 0) - tm.rating) <= 2.5
      )
      SELECT *
      FROM genre_matches
      WHERE shared_genres_count > 0
        AND genre_similarity >= 0.3  -- Almeno 30% di generi condivisi
        AND rating_similarity >= 0.7  -- Rating abbastanza simili
      ORDER BY similarity_score DESC, shared_genres_count DESC, rating DESC
      LIMIT $2;
    `;

    const result = await pool.query(improvedQuery, [mediaId, limit]);

    if (result.rows.length === 0) {
      // Fallback più selettivo: stesso tipo, rating simili
      const fallbackQuery = `
        WITH target_media AS (
          SELECT type, rating, release_date FROM media 
          WHERE id = $1 AND streamable = TRUE AND rating IS NOT NULL
        )
        SELECT m.*
        FROM media m
        CROSS JOIN target_media tm
        WHERE m.id != $1
          AND m.streamable = TRUE
          AND m.type = tm.type
          AND m.rating IS NOT NULL
          -- Rating simili (+-2 punti)
          AND ABS(COALESCE(m.rating, 0) - tm.rating) <= 2.0
        ORDER BY 
          -- Prima per similarità di rating
          (1.0 - ABS(COALESCE(m.rating, 0) - tm.rating) / 10.0) DESC,
          -- Poi per rating alto
          m.rating DESC,
          -- Infine per data recente
          m.release_date DESC
        LIMIT $2;
      `;
      
      const fallbackResult = await pool.query(fallbackQuery, [mediaId, limit]);
      
      if (fallbackResult.rows.length === 0) {
        // Ultimo fallback: solo stesso tipo, migliori rating
        const lastFallbackQuery = `
          WITH target_media AS (
            SELECT type FROM media WHERE id = $1 AND streamable = TRUE
          )
          SELECT m.*
          FROM media m
          CROSS JOIN target_media tm
          WHERE m.id != $1
            AND m.streamable = TRUE
            AND m.type = tm.type
            AND m.rating IS NOT NULL
            AND m.rating >= 7.0  -- Solo contenuti con rating decente
          ORDER BY m.rating DESC, m.release_date DESC
          LIMIT $2;
        `;
        
        const lastResult = await pool.query(lastFallbackQuery, [mediaId, limit]);
        return NextResponse.json(lastResult.rows);
      }
      
      return NextResponse.json(fallbackResult.rows);
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching related programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related programs' },
      { status: 500 }
    );
  }
}