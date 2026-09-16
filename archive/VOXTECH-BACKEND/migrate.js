import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf8");
  console.log("[migrate] Applying schema.sql ...");
  await pool.query(sql);
  console.log("[migrate] Done.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("[migrate] Failed:", err);
  process.exit(1);
});
