import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearchQuery = searchParams.get("search");
    const searchQuery = searchParams.get("search")?.trim() || "";

    const typeQuery = searchParams.get("type")?.trim() || "";
    const orderbyQuery = searchParams.get("orderby")?.trim() || "";
    // Fix: Check for both 'genre' and 'genreId' parameters
    const genreQuery = searchParams.get("genreId")?.trim() || searchParams.get("genre")?.trim() || "";
    const ratingQuery = searchParams.get("rating")?.trim() || "";
    const ratingDirection = searchParams.get("rating_dir")?.trim() || "gte"; // gte = maggiore/uguale, lte = minore/uguale
    const orderDirection = searchParams.get("order_dir")?.trim() || "asc"; // asc o desc
    const yearQuery = searchParams.get("year")?.trim() || "";

    function normalizeString(s: string): string {
      return s
        .toLowerCase()
        .replace(/[.,\-'':–—]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // Costruzione dinamica della query
    let baseQuery = `SELECT DISTINCT m.* FROM media m`;
    let joins = ""; // Vuoto ora
    let whereConditions = ["m.streamable = TRUE"];
    let queryParams: any[] = [];
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

    // Costruzione query finale
    const finalQuery = `
      ${baseQuery}
      ${joins}
      WHERE ${whereConditions.join(' AND ')}
      ${orderBy}
    `;

    console.log('Final query:', finalQuery);
    console.log('Query params:', queryParams);

    // Validazione per ricerca testuale
    if (rawSearchQuery !== null && searchQuery.length < 3) {
      return NextResponse.json(
        { error: "Inserisci più di tre caratteri." },
        { status: 400 }
      );
    }

    const result = await pool.query(finalQuery, queryParams);
    const medias = result.rows;

    console.log('Results found:', medias.length);
    return NextResponse.json(medias);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}