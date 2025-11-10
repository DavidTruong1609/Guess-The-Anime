import { Router } from "express";
import { getAnimeDetails, getAnimeGenres, getAnimeStudios, getAnimeTitles } from "../controllers/animeController.ts";

const router = Router();

router.get("/anime", getAnimeDetails)
router.get("/anime-titles", getAnimeTitles)
router.get("/anime-genres", getAnimeGenres)
router.get("/anime-studios", getAnimeStudios)

export default router;