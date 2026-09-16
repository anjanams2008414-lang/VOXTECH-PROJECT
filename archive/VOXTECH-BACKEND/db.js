import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.pgSsl ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on("error", (err) => {
  console.error("[db] Unexpected PostgreSQL client error", err);
});

export async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (env.nodeEnv !== "production") {
    console.log("[db]", text.replace(/\s+/g, " ").trim(), `(${Date.now() - start}ms)`);
  }
  return result;
}

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
