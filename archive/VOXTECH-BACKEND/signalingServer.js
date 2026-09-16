import { WebSocketServer } from "ws";
import { URL } from "url";
import { verifyTokenString } from "../middleware/auth.js";
import { joinRoom, leaveRoom, getPeers, findSocketRoom } from "./rooms.js";
import { findCallByRoomCode, addParticipant, markParticipantLeft } from "../models/callModel.js";
import { logger } from "../utils/logger.js";

/**
 * Pure signaling: this server never sees decrypted audio. It only relays
 * SDP offers/answers and ICE candidates between two peers so their browsers
 * can establish a direct WebRTC connection, over which DTLS-SRTP encrypts
 * the actual audio automatically (that negotiation happens entirely inside
 * the browsers/WebRTC stack, not in this code).
 *
 * Message shapes (JSON over the WebSocket):
 *   { type: "join",      roomCode }
 *   { type: "offer",     roomCode, sdp, to }
 *   { type: "answer",    roomCode, sdp, to }
 *   { type: "ice-candidate", roomCode, candidate, to }
 *   { type: "leave",     roomCode }
 */
export function attachSignalingServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/signal" });

  wss.on("connection", (socket, req) => {
    let auth;
    try {
      const { searchParams } = new URL(req.url, "http://localhost");
      const token = searchParams.get("token");
      auth = verifyTokenString(token);
    } catch (err) {
      socket.close(4001, "Unauthorized");
      return;
    }

    const userId = auth.sub;
    logger.info(`[signaling] connected user=${userId}`);

    socket.on("message", async (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return socket.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      }

      const { type, roomCode } = msg;

      switch (type) {
        case "join": {
          const call = await findCallByRoomCode(roomCode);
          if (!call || call.status !== "active") {
            return socket.send(JSON.stringify({ type: "error", message: "Room not found or ended" }));
          }
          joinRoom(roomCode, userId, socket);
          await addParticipant({ callId: call.id, userId, language: msg.language || null });

          // Tell the newcomer who's already in the room, and tell existing peers about the newcomer.
          const peers = getPeers(roomCode, userId);
          socket.send(JSON.stringify({ type: "joined", peers: peers.map(([id]) => id) }));
          for (const [, peerSocket] of peers) {
            peerSocket.send(JSON.stringify({ type: "peer-joined", userId }));
          }
          break;
        }

        case "offer":
        case "answer":
        case "ice-candidate": {
          const peers = getPeers(roomCode, userId);
          const target = peers.find(([id]) => id === msg.to);
          if (target) {
            target[1].send(JSON.stringify({ ...msg, from: userId }));
          }
          break;
        }

        case "leave": {
          await handleLeave(socket, roomCode, userId);
          break;
        }

        default:
          socket.send(JSON.stringify({ type: "error", message: `Unknown message type: ${type}` }));
      }
    });

    socket.on("close", async () => {
      const located = findSocketRoom(socket);
      if (located) await handleLeave(socket, located.roomCode, located.userId);
      logger.info(`[signaling] disconnected user=${userId}`);
    });
  });

  return wss;
}

async function handleLeave(socket, roomCode, userId) {
  leaveRoom(roomCode, userId);
  const peers = getPeers(roomCode, userId);
  for (const [, peerSocket] of peers) {
    peerSocket.send(JSON.stringify({ type: "peer-left", userId }));
  }
}
