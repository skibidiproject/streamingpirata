import { NextResponse } from "next/server";
import pool from "@/app/lib/database";
import { Label } from "@headlessui/react";

export async function GET(
    request: Request,
    { params }: { params: { id: string, type: string } }) {
    const type =  params.type;
    const id = await params.id;


    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(today.getDate() - 14);
    twoWeeksAgo.setHours(0, 0, 0, 0);

    /*
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(today.getDate() - 14);
    oneMonthAgo.setHours(0, 0, 0, 0);
    */

    if (type === "tv") {
        const result = await pool.query(`SELECT release_date FROM media WHERE id = $1 AND type = 'tv'`, [id]);
        const releaseDate = new Date(result.rows[0].release_date);
        // Azzerare orario per confrontare solo data
        releaseDate.setHours(0, 0, 0, 0);


        const resultMostRecentSeason = await pool.query(`SELECT tv_seasons.season_number, release_date FROM tv_seasons WHERE media_id = $1
	        ORDER BY release_date DESC`, [id]);
        const mostRecentSeasonReleaseDate = new Date(resultMostRecentSeason.rows[0].release_date)
        mostRecentSeasonReleaseDate.setHours(0, 0, 0, 0);

        const resultMostRecentEpisode = await pool.query(`SELECT te.release_date AS release_date FROM tv_episodes te INNER JOIN tv_seasons ts ON ts.id = te.season_id
	WHERE media_id = $1
	ORDER BY release_date DESC`, [id]);
        const mostRecentEpisodeReleaseDate = new Date(resultMostRecentEpisode.rows[0].release_date)
        mostRecentEpisodeReleaseDate.setHours(0, 0, 0, 0);


        const isNewRelease = releaseDate >= twoWeeksAgo && releaseDate <= today;
        const isNewSeason = mostRecentSeasonReleaseDate >= twoWeeksAgo && mostRecentSeasonReleaseDate <= today;
        const isNewEpisode = mostRecentEpisodeReleaseDate >= oneWeekAgo && mostRecentEpisodeReleaseDate <= today;

        let data;

        if (isNewRelease) {
            data = {
                label: true,
                text: 'Nuova uscita',
            };
        } else if (isNewSeason) {
            data = {
                label: true,
                text: 'Nuova stagione',
            };
        } else if (isNewEpisode) {
            data = {
                label: true,
                text: 'Nuovo episodio',
            };
        } else {
            data = {
                label: false,
            };
        }

        return NextResponse.json(data);

    } else if (type == 'movie') {
        const result = await pool.query(`SELECT release_date FROM media WHERE id = $1 AND type = 'movie'`, [id]);
        const media = result.rows[0];
        const releaseDate = new Date(media.release_date);
        const today = new Date();
        const twoWeeksAgo = new Date();
        // Azzerare orario per confrontare solo data
        releaseDate.setHours(0, 0, 0, 0);

        let data;

        if (releaseDate >= oneWeekAgo && releaseDate <= today) {
            data = {
                label: true,
                text: 'Nuova uscita',
            };
        }
        else {
            data = {
                label: false
            };
        }
        return NextResponse.json(data);
    }
}
