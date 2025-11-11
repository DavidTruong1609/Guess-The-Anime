import type { Request, Response } from 'express';
import pool from "../config/db.ts"

export const getAnimeDetails = async (req: Request, res: Response) => {
    try {
        const allAnime = await pool.query("SELECT * from anime")
        res.status(200).json(allAnime.rows)
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
        res.status(200).json(allAnimeTitles.rows)
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
        res.status(200).json(allAnimeGenres.rows)
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
        res.status(200).json(allAnimeStudios.rows)
    }
    catch (error) {
        if (error instanceof Error) {
            console.log(error.message)
            res.status(500).send("Server Error")
        }
    }
}

export const getRandomAnime = async (req: Request, res: Response) => {
    try {
        const randomAnime = await pool.query("SELECT * FROM anime ORDER BY RANDOM() LIMIT 1")
        res.status(200).json(randomAnime.rows[0]);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching random anime:", error);
            res.status(500).json({ error: "Failed to get random anime." });
        }
    }
}