import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: { id: string, type: string } }) {
    const type = params.type;
    
    if (type === 'tv') {
        const id = await params.id;
        const result = await pool.query('SELECT * FROM tv_seasons WHERE media_id = $1 AND streamable = TRUE ORDER BY season_number', [id]);
        const media = result.rows;

        return NextResponse.json(media);
    }
}
