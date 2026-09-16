import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { startCall, getCall, finishCall } from "../controllers/callController.js";

const router = Router();

router.post("/", requireAuth, startCall);
router.get("/:roomCode", requireAuth, getCall);
router.post("/:roomCode/end", requireAuth, finishCall);

export default router;
