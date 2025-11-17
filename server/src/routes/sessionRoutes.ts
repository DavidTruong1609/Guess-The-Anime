import { Router } from "express";
import { deleteSession, getSession, postSession } from "../controllers/sessionController.ts";

const router = Router();

router.get("/", getSession)
router.post("/", postSession)
router.delete("/", deleteSession)

export default router;