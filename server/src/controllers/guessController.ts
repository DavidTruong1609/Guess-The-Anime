import type { Request, Response } from "express";
import pool from "../config/db.ts";

/**
Fetches all previous and current guesses in the database and returns it as a formatted JSON response.

@param {Request} req - The Express request object
@param {Response} res - The Express response object, used to send a JSON response with all the guesses data.

*/
export const getGuesses = async (req: Request, res: Response) => {
    try {
        const allGuesses = await pool.query(
            `SELECT guesses.anime_id, guesses.correct, anime.title, anime.thumbnail, anime.source, anime.start_season, anime.mean, anime.media_type,
            jsonb_agg(DISTINCT genres.name) AS genres,
            jsonb_agg(DISTINCT studios.name) AS studios
            FROM guesses
			LEFT JOIN anime ON anime.mal_id = guesses.anime_id
            LEFT JOIN anime_genres ON anime_genres.anime_id = anime.mal_id
            LEFT JOIN genres ON genres.id = anime_genres.genre_id
            LEFT JOIN anime_studios ON anime_studios.anime_id = anime.mal_id
            LEFT JOIN studios ON studios.id = anime_studios.studio_id
            GROUP BY guesses.id, anime.title, anime.thumbnail, anime.source, anime.start_season, anime.mean, anime.media_type
            ORDER BY guesses.created_at DESC`
        )
        const filteredGuesses = allGuesses.rows.map((guess) => ({
            animeId: guess.anime_id,
            correct: guess.correct,
            title: guess.title,
            thumbnail: guess.thumbnail,
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

/**
Post and add a guess with the animeId request body to the database. Function also checks the game session
anime to ensure whether the guess is correct or not before inserting the guess into the guesses database.

@param {Request} req - The Express request object, containing query parameters (specifically `animeId`).
@param {Response} res - The Express response object, used to send a JSON response with the guess outcome (whether correct or not).

*/
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

/**
Delete and clear all guesses from the guesses database table.

@param {Request} req - The Express request object.
@param {Response} res - The Express response object, used to send a JSON response noting if the delete was successful or not.

*/
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
