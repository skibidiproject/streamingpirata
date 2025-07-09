import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }) {
    const id = await params.id;

    const result = await pool.query('SELECT * FROM tv_seasons WHERE media_id = $1 AND streamable = TRUE', [id]);

    const media = result.rows;

    return NextResponse.json(media);
}
