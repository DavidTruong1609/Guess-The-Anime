import { Router } from "express";
import { getAnimeDetails, getAnimeTitles, getRandomAnime } from "../controllers/animeController.ts";

const router = Router();

router.get("/anime", getAnimeDetails)
router.get("/anime-titles", getAnimeTitles)
router.get("/random-anime", getRandomAnime)

export default router;