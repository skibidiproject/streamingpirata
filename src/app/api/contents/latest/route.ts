import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {

    const result = await pool.query(`SELECT * FROM media m WHERE m.release_date >= CURRENT_DATE - INTERVAL '60 days'`)


    const medias = result.rows;

    return NextResponse.json(medias);
}