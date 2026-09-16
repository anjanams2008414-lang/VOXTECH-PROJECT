import bcrypt from "bcryptjs";
import { createUser, findUserByEmail } from "../models/userModel.js";
import { signToken } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, preferredLanguage } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "name, email, and password are required" });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "password must be at least 8 characters" });
  }

  const existing = await findUserByEmail(email.toLowerCase());
  if (existing) return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({
    name,
    email: email.toLowerCase(),
    passwordHash,
    preferredLanguage,
  });

  const token = signToken(user);
  res.status(201).json({ user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const user = await findUserByEmail(email.toLowerCase());
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: "Invalid credentials" });

  const token = signToken(user);
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      preferredLanguage: user.preferred_language,
    },
    token,
  });
});
