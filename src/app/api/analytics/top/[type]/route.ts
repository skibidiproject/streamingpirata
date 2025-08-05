import { NextRequest } from "next/server"
import pool from "@/app/lib/database"

export async function GET(req: NextRequest, { params }: { params: Promise<{ type: string }> }) {
    const { type } = await params;
    if (type != 'tv' && type != 'movie') {
        return new Response(JSON.stringify({ message: "Type non supportato" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    } else {
        const data = await pool.query(`
            WITH data_recente AS (
                SELECT MAX(timestamp_) AS max_timestamp
                FROM analytics_history
            ),
            settimana AS (
                SELECT ah.* 
                FROM analytics_history ah, data_recente dr
                WHERE ah.timestamp_ >= dr.max_timestamp - INTERVAL '7 days' 
                AND ah.media_type = $1 
            ),
            conteggi AS (
                SELECT 
                    media_id, 
                    media_type, 
                    COUNT(*) AS views 
                FROM settimana 
                GROUP BY media_id, media_type
            )
            SELECT 
                c.views, 
                m.* 
            FROM conteggi c
            LEFT JOIN media m ON c.media_id = m.id AND c.media_type = m.type
            ORDER BY c.views DESC 
            LIMIT 10
        `, [type])

        return new Response(JSON.stringify(data.rows))

    }
}  