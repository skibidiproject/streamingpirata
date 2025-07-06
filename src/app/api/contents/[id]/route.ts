import { NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }) {
    const id = await params.id;

    const result = await pool.query('SELECT * FROM media WHERE id = $1', [id]);

    const media = result.rows[0];

    return NextResponse.json(media);
}
