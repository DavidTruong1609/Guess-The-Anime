import { Router } from "express";
import { postSession } from "../controllers/sessionController.ts";

const router = Router();

router.post("/get-guesses", postSession)

export default router;