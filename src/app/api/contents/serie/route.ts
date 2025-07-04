import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/lib/database";

export async function GET(request: NextRequest) {
    const connection = await db;
    const [result] = await connection.execute('select * from serie')

    const medias = result as any[];

    return NextResponse.json(medias);
}