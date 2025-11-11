import type { Request, Response } from 'express';
import pool from "../config/db.ts";

export const getGuesses = async (req: Request, res: Response) => {
    try {
        const allGuesses = await pool.query(
            `SELECT guess.id as guess_id, guess.anime_id, anime.title, anime.source, anime.start_season, anime.mean
            FROM guesses guess 
            INNER JOIN anime anime ON guess.anime_id = anime.mal_id
            ORDER BY guess.created_at DESC;`
        )
        res.json(allGuesses.rows)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).json({ message: 'Error fetching all guesses' });
        }
    }
}

export const postGuess = async (req: Request, res: Response) => {
    try {
        const { animeId, correct } = req.body;

        const postGuess = await pool.query("INSERT INTO guesses (anime_id, correct) VALUES ($1, $2) ON CONFLICT DO NOTHING", [animeId, correct || false])

        res.json(postGuess.rows[0]);
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).json({ message: 'Error posting guess' });
        }
    }
}

export const deleteGuesses = async (req: Request, res: Response) => {
    try {
        await pool.query("DELETE FROM guesses")
        
        res.status(200).json({ message: 'All guesses deleted successfully.' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).json({ message: 'Error deleting guess' });
        }
    }
}
