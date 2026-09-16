import { findUserById, updateUserLanguage } from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export const updateLanguage = asyncHandler(async (req, res) => {
  const { preferredLanguage } = req.body;
  if (!preferredLanguage) return res.status(400).json({ error: "preferredLanguage is required" });
  const user = await updateUserLanguage(req.user.id, preferredLanguage);
  res.json({ user });
});
