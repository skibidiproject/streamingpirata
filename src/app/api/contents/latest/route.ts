import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {

    const result = await pool.query(`SELECT 
        m.*, 
        COALESCE(
            (SELECT MAX(s.release_date) 
            FROM tv_seasons s 
            WHERE s.media_id = m.id AND s.streamable = TRUE),
            m.release_date
        ) AS release_date_for_order
        FROM media m
        WHERE 
        m.streamable = TRUE
        AND (
            EXISTS (
            SELECT 1 
            FROM tv_seasons s 
            WHERE s.media_id = m.id 
                AND s.streamable = TRUE 
                AND s.release_date >= CURRENT_DATE - INTERVAL '60 days'
            )
            OR
            m.release_date >= CURRENT_DATE - INTERVAL '60 days'
        )
        ORDER BY release_date_for_order DESC;
    `)


    const medias = result.rows;

    return NextResponse.json(medias);
}