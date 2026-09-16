import twilio from "twilio";
import { env } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Returns a short-lived set of STUN/TURN servers for the frontend's RTCPeerConnection
 * `iceServers` config, using Twilio's Network Traversal Service. Falls back to public
 * Google STUN if Twilio isn't configured (STUN-only means calls between peers on
 * restrictive/symmetric NATs may fail — TURN is what makes those reliable).
 */
export const getIceServers = asyncHandler(async (req, res) => {
  if (!env.twilioSid || !env.twilioToken) {
    return res.json({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      warning: "Twilio not configured — STUN-only fallback in use, TURN relay unavailable",
    });
  }

  const client = twilio(env.twilioSid, env.twilioToken);
  const token = await client.tokens.create();
  res.json({ iceServers: token.iceServers, ttl: token.ttl });
});
