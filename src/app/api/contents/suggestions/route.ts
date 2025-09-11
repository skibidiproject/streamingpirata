import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawSearchQuery = searchParams.get("search");
    const searchQuery = searchParams.get("search")?.trim() || "";

    // Validation for search query
    if (rawSearchQuery === null || searchQuery.length < 3) {
      return NextResponse.json(
        { error: "Inserisci più di tre caratteri." },
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

    const normalizedQuery = normalizeString(searchQuery);
    const search = `%${normalizedQuery}%`;

    // Simple query for suggestions - just basic media info, limited to 5 results
    const query = `
      SELECT 
        id,
        title,
        type,
        release_date,
        rating,
        poster_url
      FROM media 
      WHERE 
        streamable = TRUE 
        AND LOWER(
          TRIM(
            REGEXP_REPLACE(
              REGEXP_REPLACE(title, '[.,\\-'':–—]', ' ', 'g'),
              '\\s+', ' ', 'g'
            )
          )
        ) LIKE $1
      ORDER BY 
        -- Prioritize exact matches and higher ratings
        CASE 
          WHEN LOWER(title) = LOWER($2) THEN 1
          WHEN LOWER(title) LIKE LOWER($3) THEN 2
          ELSE 3
        END,
        rating DESC,
        title ASC
      LIMIT 5
    `;

    const result = await pool.query(query, [
      search,
      searchQuery.toLowerCase(),
      `${searchQuery.toLowerCase()}%`
    ]);

    return NextResponse.json({
      suggestions: result.rows
    });

  } catch (error) {
    console.error('Search Suggestions API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}