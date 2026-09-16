import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe, updateLanguage } from "../controllers/userController.js";

const router = Router();

router.get("/me", requireAuth, getMe);
router.patch("/me/language", requireAuth, updateLanguage);

export default router;
