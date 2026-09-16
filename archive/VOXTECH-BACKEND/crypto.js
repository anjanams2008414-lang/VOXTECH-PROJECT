import crypto from "crypto";
import { env } from "../config/env.js";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(env.aesKeyHex, "hex"); // 32 bytes
const IV_LENGTH = 12; // 96-bit IV is recommended/standard for GCM

/**
 * Encrypts plaintext (e.g. a transcript line, a chat message) with AES-256-GCM.
 * Returns hex-encoded ciphertext, iv, and auth tag so all three can be stored in Postgres
 * and used to decrypt later. Never reuse an IV with the same key — a fresh random IV
 * is generated on every call.
 */
export function encrypt(plaintext) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString("hex"),
    iv: iv.toString("hex"),
    tag: authTag.toString("hex"),
  };
}

/**
 * Decrypts a value previously produced by encrypt(). Throws if the auth tag doesn't
 * match, which means the ciphertext (or iv/tag) was tampered with or corrupted.
 */
export function decrypt({ ciphertext, iv, tag }) {
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, Buffer.from(iv, "hex"));
  decipher.setAuthTag(Buffer.from(tag, "hex"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "hex")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

/** Helper to hash room codes / short-lived tokens for lookups without storing them raw. */
export function sha256Hex(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

/** Generates a short, URL-safe random room code, e.g. for call invite links. */
export function generateRoomCode(length = 8) {
  return crypto.randomBytes(length).toString("base64url").slice(0, length);
}
