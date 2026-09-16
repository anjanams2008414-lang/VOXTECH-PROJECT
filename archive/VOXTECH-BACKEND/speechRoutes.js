import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import { transcribe, translate, speak } from "../controllers/speechController.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB, matches typical Whisper API limits
});

const router = Router();

router.post("/transcribe", requireAuth, upload.single("audio"), transcribe);
router.post("/translate", requireAuth, translate);
router.post("/tts", requireAuth, speak);

export default router;
