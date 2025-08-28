import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearchQuery = searchParams.get("search");
    const searchQuery = searchParams.get("search")?.trim() || "";

    const typeQuery = searchParams.get("type")?.trim() || "";
    const orderbyQuery = searchParams.get("orderby")?.trim() || "";
    const genreQuery = searchParams.get("genreId")?.trim() || searchParams.get("genre")?.trim() || "";
    const ratingQuery = searchParams.get("rating")?.trim() || "";
    const ratingDirection = searchParams.get("rating_dir")?.trim() || "gte";
    const orderDirection = searchParams.get("order_dir")?.trim() || "asc";
    const yearQuery = searchParams.get("year")?.trim() || "";

    // PARAMETRI PER LA PAGINAZIONE
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Validazione parametri paginazione
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: "Parametri di paginazione non validi" },
        { status: 400 }
      );
    }

    function normalizeString(s: string): string {
      return s
        .toLowerCase()
        .replace(/[.,\-'':–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Costruzione dinamica della query con CTE per label
    const baseQuery = `
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
      media_with_labels AS (
        SELECT
          m.*,
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
      )
      SELECT m.*, label_info FROM media_with_labels m`;

    const countQuery = `
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
      media_with_labels AS (
        SELECT
          m.*,
          ss.max_season_release_date,
          le.max_episode_release_date
        FROM media m
        LEFT JOIN streamable_seasons ss ON (
          ss.media_id = m.id
          AND ss.media_type = m.type
        )
        LEFT JOIN latest_episodes le ON le.media_id = m.id
      )
      SELECT COUNT(*) as total FROM media_with_labels m`;

    const whereConditions = ["m.streamable = TRUE"];
    const queryParams: any[] = [];
    let paramCounter = 1;

    // Filtro per genere
    if (genreQuery) {
      whereConditions.push(`$${paramCounter} = ANY(m.genres_ids)`);
      queryParams.push(parseInt(genreQuery));
      paramCounter++;
    }

    // Filtro per anno
    if (yearQuery && !isNaN(parseInt(yearQuery))) {
      whereConditions.push(`EXTRACT(YEAR FROM m.release_date) = $${paramCounter}`);
      queryParams.push(parseInt(yearQuery));
      paramCounter++;
    }

    // Filtro per tipo (movie/tv)
    if (typeQuery === 'movie') {
      whereConditions.push(`m.type = $${paramCounter}`);
      queryParams.push('movie');
      paramCounter++;
    } else if (typeQuery === 'tv') {
      whereConditions.push(`m.type = $${paramCounter}`);
      queryParams.push('tv');
      paramCounter++;
      // Per TV, assicurati che ci siano stagioni streamabili
      whereConditions.push(`(m.type = 'movie' OR m.max_season_release_date IS NOT NULL)`);
    }

    // Filtro per rating
    if (ratingQuery && !isNaN(parseFloat(ratingQuery))) {
      const ratingValue = parseFloat(ratingQuery);
      if (ratingDirection === 'lte') {
        whereConditions.push(`m.rating <= $${paramCounter}`);
      } else {
        whereConditions.push(`m.rating >= $${paramCounter}`);
      }
      queryParams.push(ratingValue);
      paramCounter++;
    }

    // Filtro per ricerca testuale
    if (rawSearchQuery !== null && searchQuery.length >= 3) {
      const normalizedQuery = normalizeString(searchQuery);
      const search = `%${normalizedQuery}%`;

      whereConditions.push(`
        LOWER(
          TRIM(
            REGEXP_REPLACE(
              REGEXP_REPLACE(m.title, '[.,\\-'':–—]', ' ', 'g'),
              '\\s+', ' ', 'g'
            )
          )
        ) LIKE $${paramCounter}
      `);
      queryParams.push(search);
      paramCounter++;
    }

    // Costruzione WHERE clause
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Ordinamento
    let orderBy = "";
    if (orderbyQuery) {
      switch (orderbyQuery) {
        case 'date':
          orderBy = `ORDER BY m.release_date ${orderDirection.toUpperCase()}`;
          break;
        case 'rating':
          orderBy = `ORDER BY m.rating ${orderDirection.toUpperCase()}`;
          break;
        case 'az':
          orderBy = `ORDER BY m.title ${orderDirection.toUpperCase()}`;
          break;
        default:
          orderBy = "ORDER BY m.title ASC";
      }
    } else {
      orderBy = "ORDER BY m.release_date DESC";
    }

    // Validazione per ricerca testuale
    if (rawSearchQuery !== null && searchQuery.length < 3) {
      return NextResponse.json(
        { error: "Inserisci più di tre caratteri." },
        { status: 400 }
      );
    }

    // Query per il conteggio totale (per la paginazione)
    const countFinalQuery = `${countQuery} ${whereClause}`;
    
    // Query per i dati paginati
    const dataFinalQuery = `
      ${baseQuery}
      ${whereClause}
      ${orderBy}
      LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
    `;

    // Aggiungi parametri per LIMIT e OFFSET
    const finalQueryParams = [...queryParams, limit, offset];

    console.log('Count query:', countFinalQuery);
    console.log('Data query:', dataFinalQuery);
    console.log('Query params:', finalQueryParams);

    // Esegui entrambe le query in parallelo
    const [countResult, dataResult] = await Promise.all([
      pool.query(countFinalQuery, queryParams),
      pool.query(dataFinalQuery, finalQueryParams)
    ]);

    const totalItems = parseInt(countResult.rows[0].total);
    const medias = dataResult.rows;
    const totalPages = Math.ceil(totalItems / limit);
    const hasMore = page < totalPages;

    console.log(`Page ${page}/${totalPages}, showing ${medias.length}/${totalItems} items`);

    // Ritorna i dati con metadati di paginazione
    return NextResponse.json({
      data: medias,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
        hasMore,
        itemsOnPage: medias.length
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}