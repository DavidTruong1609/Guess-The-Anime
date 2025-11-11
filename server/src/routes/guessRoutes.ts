import { Router } from "express";
import { deleteGuesses, getGuesses, postGuess } from "../controllers/guessController.ts";

const router = Router();

router.get("/get-guesses", getGuesses)
router.post("/post-guess", postGuess)
router.delete("/delete-guesses", deleteGuesses)

export default router;