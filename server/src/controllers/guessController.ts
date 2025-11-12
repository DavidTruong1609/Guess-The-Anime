import type { Request, Response } from "express";
import pool from "../config/db.ts";

export const getGuesses = async (req: Request, res: Response) => {
    try {
        const allGuesses = await pool.query(
            `SELECT guesses.anime_id, guesses.correct, anime.title, anime.source, anime.start_season, anime.mean, anime.media_type,
            jsonb_agg(DISTINCT genres.name) AS genres,
            jsonb_agg(DISTINCT studios.name) AS studios
            FROM guesses
			LEFT JOIN anime ON anime.mal_id = guesses.anime_id
            LEFT JOIN anime_genres ON anime_genres.anime_id = anime.mal_id
            LEFT JOIN genres ON genres.id = anime_genres.genre_id
            LEFT JOIN anime_studios ON anime_studios.anime_id = anime.mal_id
            LEFT JOIN studios ON studios.id = anime_studios.studio_id
            GROUP BY guesses.id, anime.title, anime.source, anime.start_season, anime.mean, anime.media_type
            ORDER BY guesses.created_at DESC`
        )
        const filteredGuesses = allGuesses.rows.map((guess) => ({
            animeId: guess.anime_id,
            correct: guess.correct,
            title: guess.title,
            source: guess.source,
            startSeason: guess.start_season,
            mean: guess.mean,
            mediaType: guess.media_type,
            genres: guess.genres,
            studios: guess.studios,
        }))
        res.status(200).json(filteredGuesses)
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error querying all guesses: ", error.message)
            res.status(500).send("Error querying all guesses.")
        }
    }
}

export const postGuess = async (req: Request, res: Response) => {
    try {
        const { animeId } = req.body

        let correct = false

        const gameSession = await pool.query("SELECT anime_id FROM game_session")

        const animeToGuessId = gameSession.rows[0].anime_id

        if (animeId === animeToGuessId) {
            correct = true
        }

        await pool.query("INSERT INTO guesses (anime_id, correct) VALUES ($1, $2) ON CONFLICT DO NOTHING", [animeId, correct])

        res.status(200).json({ 
            message: "Successfully posted guess.",
            correct: correct,
         })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error posting guess into database: ", error.message)
            res.status(500).send("Error posting guess into database.")
        }
    }
}

export const deleteGuesses = async (req: Request, res: Response) => {
    try {
        await pool.query("DELETE FROM guesses")
        
        res.status(200).json({ message: "Successfully deleted all guesses." })
    }
    catch (error) {
        if (error instanceof Error) {
            console.log("Error deleting guesses: ", error.message)
            res.status(500).send("Error deleting guesses.")
        }
    }
}
