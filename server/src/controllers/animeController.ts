import type { Request, Response } from "express"
import pool from "../config/db.ts"

export const getAnimeDetails = async (req: Request, res: Response) => {
    try {
        const allAnimeDetails = await pool.query(
            `SELECT mal_id, title, source, start_season, mean, media_type,
            jsonb_agg(DISTINCT genres.name) as genres,
            jsonb_agg(DISTINCT studios.name) as studios
            FROM anime
            LEFT JOIN anime_genres ON anime_genres.anime_id = anime.mal_id
            LEFT JOIN genres ON genres.id = anime_genres.genre_id
            LEFT JOIN anime_studios ON anime_studios.anime_id = anime.mal_id
            LEFT JOIN studios ON studios.id = anime_studios.studio_id
            GROUP BY anime.id`
        )

        const formattedAnime = allAnimeDetails.rows.map((anime) => ({
            malId: anime.mal_id,
            title: anime.title,
            source: anime.source,
            startSeason: anime.start_season,
            mean: anime.mean,
            mediaType: anime.media_type,
            genres: anime.genres,
            studios: anime.studios,
        }))

        res.status(200).json(formattedAnime)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error querying anime list: ", error.message)
            res.status(500).send("Error querying anime list.")
        }
    }
}

export const getAnimeTitles = async (req: Request, res: Response) => {
    try {
        const allAnimeTitles = await pool.query("SELECT anime_id, title FROM anime_titles")

        const formatttedAnimeTitles = allAnimeTitles.rows.map((anime) => ({
            animeId: anime.anime_id,
            title: anime.title,
        }))
        
        res.status(200).json(formatttedAnimeTitles)
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error querying anime titles: ", error.message)
            res.status(500).send("Error querying anime titles.")
        }
    }
}

export const getRandomAnime = async (req: Request, res: Response) => {
    try {
        const randomAnime = await pool.query(
            `SELECT mal_id, title, source, start_season, mean, media_type,
            jsonb_agg(DISTINCT genres.name) as genres,
            jsonb_agg(DISTINCT studios.name) as studios
            FROM anime
            LEFT JOIN anime_genres ON anime_genres.anime_id = anime.mal_id
            LEFT JOIN genres ON genres.id = anime_genres.genre_id
            LEFT JOIN anime_studios ON anime_studios.anime_id = anime.mal_id
            LEFT JOIN studios ON studios.id = anime_studios.studio_id
            GROUP BY anime.id
            ORDER BY RANDOM()
            LIMIT 1`
        )

        const formattedRandomAnime = randomAnime.rows.map((anime) => ({
            malId: anime.mal_id,
            title: anime.title,
            source: anime.source,
            startSeason: anime.start_season,
            mean: anime.mean,
            mediaType: anime.media_type,
            genres: anime.genres,
            studios: anime.studios,
        }))

        res.status(200).json(formattedRandomAnime[0])
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error querying random anime: ", error.message)
            res.status(500).send("Error querying random anime.")
        }
    }
}