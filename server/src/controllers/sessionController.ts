import type { Request, Response } from "express"
import pool from "../config/db.ts"

/**
Fetches the existing game session from the database and returns the anime id in a formatted JSON response.

@param {Request} req - The Express request object.
@param {Response} res - The Express response object, used to send a JSON response with the anime id.

*/
export const getSession = async (req: Request, res: Response) => {
    try {
        const gameSession = await pool.query("SELECT anime_id FROM game_session")

        const formattedGameSession = gameSession.rows.map((session) => ({
            animeId: session.anime_id,
        }))

        res.status(200).json(formattedGameSession[0])
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error posting game session into database: ", error.message)
            res.status(500).send("Error posting game session into database.")
        }
    }
}

/**
Posts and creates a new game session into the game session database table.

@param {Request} req - The Express request object.
@param {Response} res - The Express response object.

*/
export const postSession = async (req: Request, res: Response) => {
    try {
        const { animeId } = req.body

        await pool.query("INSERT INTO game_session (anime_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING *", [animeId])

        res.status(200).json({ message: "Successfully posted game session." })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error posting game session into database: ", error.message)
            res.status(500).send("Error posting game session into database.")
        }
    }
}

/**
Deletes and clears the game session from the game session database table.

@param {Request} req - The Express request object.
@param {Response} res - The Express response object.

*/
export const deleteSession = async (req: Request, res: Response) => {
    try {
        await pool.query("DELETE FROM game_session")

        res.status(200).json({ message: "Successfully deleted game session." })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting game session from database: ", error.message)
            res.status(500).send("Error deleting game session from database.")
        }
    }
}