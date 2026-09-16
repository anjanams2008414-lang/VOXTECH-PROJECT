import { query } from "../config/db.js";

export async function createUser({ name, email, passwordHash, preferredLanguage }) {
  const { rows } = await query(
    `INSERT INTO users (name, email, password_hash, preferred_language)
     VALUES ($1, $2, $3, COALESCE($4, 'en-IN'))
     RETURNING id, name, email, preferred_language, created_at`,
    [name, email, passwordHash, preferredLanguage]
  );
  return rows[0];
}

export async function findUserByEmail(email) {
  const { rows } = await query(`SELECT * FROM users WHERE email = $1`, [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await query(
    `SELECT id, name, email, preferred_language, created_at FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] || null;
}

export async function updateUserLanguage(id, preferredLanguage) {
  const { rows } = await query(
    `UPDATE users SET preferred_language = $2, updated_at = now() WHERE id = $1
     RETURNING id, name, email, preferred_language`,
    [id, preferredLanguage]
  );
  return rows[0] || null;
}
