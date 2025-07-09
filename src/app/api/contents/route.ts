import { NextRequest, NextResponse } from "next/server";
import pool from "@/app/lib/database";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);

    const rawSearchQuery = searchParams.get("search");
    const searchQuery = searchParams.get("search")?.trim() || "";


    if(rawSearchQuery === null)
    {
        const result = await pool.query("SELECT * FROM media WHERE streamable = TRUE ");
        const medias = result.rows;
        return NextResponse.json(medias);
    } else
    {

        if (searchQuery.length >= 3) {
    
            const search = `%${searchQuery}%`;
            const result = await pool.query(
                "SELECT * FROM media WHERE LOWER(title) LIKE LOWER($1) AND streamable = TRUE",
                [search]
            );
            const medias = result.rows;
            return NextResponse.json(medias);
    
        } else {
            return NextResponse.json(
                { error: "Inserisci piu di tre caratteri." },
                { status: 400 }
            );
        }
    }




}

