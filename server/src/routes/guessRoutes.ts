import { Router } from "express";
import { deleteGuesses, getGuesses, postGuess } from "../controllers/guessController.ts";

const router = Router();

router.get("/guesses", getGuesses)
router.post("/", postGuess)
router.delete("/", deleteGuesses)

export default router;