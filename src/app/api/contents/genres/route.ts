import {NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET() {

    const result = await pool.query('SELECT * FROM genres')

    const medias = result.rows;

    return NextResponse.json(medias);
}