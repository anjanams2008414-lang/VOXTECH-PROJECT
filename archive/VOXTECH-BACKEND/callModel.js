import { query } from "../config/db.js";
import { generateRoomCode } from "../utils/crypto.js";

export async function createCall({ createdBy }) {
  const roomCode = generateRoomCode(8);
  const { rows } = await query(
    `INSERT INTO calls (room_code, created_by) VALUES ($1, $2)
     RETURNING id, room_code, status, started_at`,
    [roomCode, createdBy]
  );
  return rows[0];
}

export async function findCallByRoomCode(roomCode) {
  const { rows } = await query(`SELECT * FROM calls WHERE room_code = $1`, [roomCode]);
  return rows[0] || null;
}

export async function endCall(callId) {
  const { rows } = await query(
    `UPDATE calls SET status = 'ended', ended_at = now() WHERE id = $1 RETURNING *`,
    [callId]
  );
  return rows[0] || null;
}

export async function addParticipant({ callId, userId, language }) {
  const { rows } = await query(
    `INSERT INTO call_participants (call_id, user_id, language)
     VALUES ($1, $2, $3) RETURNING id, call_id, user_id, language, joined_at`,
    [callId, userId, language]
  );
  return rows[0];
}

export async function markParticipantLeft(participantId) {
  await query(`UPDATE call_participants SET left_at = now() WHERE id = $1`, [participantId]);
}

export async function listParticipants(callId) {
  const { rows } = await query(
    `SELECT cp.id, cp.user_id, cp.language, cp.joined_at, cp.left_at, u.name, u.email
     FROM call_participants cp
     LEFT JOIN users u ON u.id = cp.user_id
     WHERE cp.call_id = $1
     ORDER BY cp.joined_at ASC`,
    [callId]
  );
  return rows;
}
