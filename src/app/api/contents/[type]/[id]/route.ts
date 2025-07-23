import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ type: string, id: string }> }) {
    
    // Await params before accessing its properties
    const { id, type } = await params;
    
    const result = await pool.query(`
        SELECT
          m.*,
          ARRAY_AGG(g.genre) AS genres_array
        FROM
          media m
        LEFT JOIN
          genres g
          ON g.id = ANY(m.genres_ids)
        WHERE
          m.id = $1 AND
          m.type = $2 AND
          m.streamable = TRUE
        GROUP BY
          m.id, m.type
    `, [id, type]);
    
    const media = result.rows[0];
    return NextResponse.json(media);
}