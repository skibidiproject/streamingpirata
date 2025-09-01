import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, type: string }> }) {
    const {type, id} = await params;
    
    if (type === 'tv') {
        const result = await pool.query('SELECT * FROM tv_seasons WHERE media_id = $1 AND streamable = TRUE ORDER BY season_number', [id]);
        const media = result.rows;

        return NextResponse.json(media);
    }
}
