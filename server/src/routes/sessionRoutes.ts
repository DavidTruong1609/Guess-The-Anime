import { Router } from "express";
import { deleteSession, getSession, postSession } from "../controllers/sessionController.ts";

const router = Router();

router.get("/get-session", getSession)
router.post("/post-session", postSession)
router.delete("/delete-session", deleteSession)

export default router;