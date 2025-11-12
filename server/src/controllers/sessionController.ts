import type { Request, Response } from "express"
import pool from "../config/db.ts"

export const postSession = async (req: Request, res: Response) => {
    try {
        const { animeId } = req.body

        await pool.query("INSERT INTO game_session (anime_id) VALUES ($1) ON CONFLICT DO NOTHING", [animeId])

        res.status(200).json({ message: "Successfully posted game session." })
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error posting game session into database: ", error.message)
            res.status(500).send("Error posting game session into database.")
        }
    }
}