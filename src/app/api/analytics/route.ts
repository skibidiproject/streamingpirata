// DEPRECATED

import pool from '@/app/lib/database';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
    const data = await req.json();
    try {
        await pool.query("INSERT INTO analytics_history(media_id, media_type) VALUES ($1, $2)", [data.id, data.type])
        return new Response(JSON.stringify({ message: 'Record inserito' }), {
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (e) {
        return new Response(JSON.stringify({ message: "Errore durante l'inserimento" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}


export async function GET(req: NextRequest) {
    const data = await pool.query(`
        WITH data_recente AS (
            SELECT MAX(timestamp_) AS max_timestamp
            FROM analytics_history
        ),
        settimana AS (
            SELECT ah.* 
            FROM analytics_history ah, data_recente dr
            WHERE ah.timestamp_ >= dr.max_timestamp - INTERVAL '7 days'
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
        LIMIT 10`
    )

    return new Response(JSON.stringify(data.rows))
}   