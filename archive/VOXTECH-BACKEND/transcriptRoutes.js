import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getTranscripts, createTranscript } from "../controllers/transcriptController.js";

const router = Router();

router.get("/:roomCode", requireAuth, getTranscripts);
router.post("/:roomCode", requireAuth, createTranscript);

export default router;
