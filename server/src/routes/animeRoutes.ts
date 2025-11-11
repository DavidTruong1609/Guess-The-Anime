import { Router } from "express";
import { getAnimeDetails, getAnimeGenres, getAnimeStudios, getAnimeTitles, getRandomAnime } from "../controllers/animeController.ts";

const router = Router();

router.get("/anime", getAnimeDetails)
router.get("/anime-titles", getAnimeTitles)
router.get("/anime-genres", getAnimeGenres)
router.get("/anime-studios", getAnimeStudios)
router.get("/random-anime", getRandomAnime)


export default router;