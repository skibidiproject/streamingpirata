import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {

    const result = await pool.query(`SELECT DISTINCT EXTRACT(YEAR FROM release_date) AS year
        FROM media
        ORDER BY year;
    `)


    const medias = result.rows;

    return NextResponse.json(medias);
}