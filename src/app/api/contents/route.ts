import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get("search")?.trim() || "";

    // Cerca solo se la query ha almeno 3 caratteri
    if (searchQuery.length >= 3) {
        const search = `%${searchQuery}%`;
        const result = await pool.query(
            "SELECT * FROM media WHERE LOWER(title) LIKE LOWER($1)",
            [search]
        );

        const medias = result.rows;
        return NextResponse.json(medias);
    }

    // Se la query è troppo corta, restituisci un array vuoto o errore
    return NextResponse.json(
        { error: "Inserisci piu di tre caratteri." },
        { status: 400 }
    );;
}

