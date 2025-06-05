// pages/api/hero-media.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const rows = (await db).execute(" SELECT * FROM `content` WHERE Imdb_ID = 1 ");

        
        

        res.status(200).json(rows);

    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch hero media' });
    }
}