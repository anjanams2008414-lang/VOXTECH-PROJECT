// In-memory signaling room registry.
// Scales to a single Node process; for multi-instance deployments back this with
// Redis pub/sub (each instance subscribes to room channels) instead of a Map.

/** @type {Map<string, Map<string, import('ws').WebSocket>>} roomCode -> (userId -> socket) */
const rooms = new Map();

export function joinRoom(roomCode, userId, socket) {
  if (!rooms.has(roomCode)) rooms.set(roomCode, new Map());
  rooms.get(roomCode).set(userId, socket);
}

export function leaveRoom(roomCode, userId) {
  const room = rooms.get(roomCode);
  if (!room) return;
  room.delete(userId);
  if (room.size === 0) rooms.delete(roomCode);
}

export function getRoom(roomCode) {
  return rooms.get(roomCode) || new Map();
}

export function getPeers(roomCode, excludeUserId) {
  return [...getRoom(roomCode).entries()].filter(([userId]) => userId !== excludeUserId);
}

export function findSocketRoom(socket) {
  for (const [roomCode, members] of rooms.entries()) {
    for (const [userId, s] of members.entries()) {
      if (s === socket) return { roomCode, userId };
    }
  }
  return null;
}
