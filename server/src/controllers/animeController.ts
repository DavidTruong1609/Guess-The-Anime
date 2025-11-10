import type { Request, Response } from 'express';
import pool from "../config/db.ts"

export const getAnimeDetails = async (req: Request, res: Response) => {
    try {
        const allAnime = await pool.query("SELECT * from anime")
        res.json(allAnime.rows)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).json({ message: 'Error fetching anime list' });
        }
    }
}

export const getAnimeTitles = async (req: Request, res: Response) => {
    try {
        const allAnimeTitles = await pool.query("SELECT * from anime_titles")
        res.json(allAnimeTitles.rows)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).send("Server Error")
        }
    }
}

export const getAnimeGenres = async (req: Request, res: Response) => {
    try {
        const allAnimeGenres = await pool.query("SELECT * from anime_genres")
        res.json(allAnimeGenres.rows)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).send("Server Error")
        }
    }
}

export const getAnimeStudios = async (req: Request, res: Response) => {
    try {
        const allAnimeStudios = await pool.query("SELECT * from anime_studios")
        res.json(allAnimeStudios.rows)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).send("Server Error")
        }
    }
}