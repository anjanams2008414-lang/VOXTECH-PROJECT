import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getIceServers } from "../controllers/iceController.js";

const router = Router();

router.get("/", requireAuth, getIceServers);

export default router;
