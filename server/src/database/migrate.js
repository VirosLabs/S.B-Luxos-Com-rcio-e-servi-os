import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool } from "./pool.js";

const migrationDirectory = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "migrations");
const migrationNamePattern = /^\d{3}_[a-z0-9_]+\.sql$/;

export async function runMigrations() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      migration_name VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB
  `);

  const files = (await fs.readdir(migrationDirectory))
    .filter((name) => migrationNamePattern.test(name))
    .sort();
  const [appliedRows] = await pool.query("SELECT migration_name FROM schema_migrations");
  const applied = new Set(appliedRows.map((row) => row.migration_name));

  for (const migrationName of files) {
    if (applied.has(migrationName)) continue;
    const sql = await fs.readFile(path.join(migrationDirectory, migrationName), "utf8");
    const connection = await pool.getConnection();
    try {
      await connection.query(sql);
      await connection.execute(
        "INSERT INTO schema_migrations (migration_name) VALUES (?)",
        [migrationName],
      );
    } finally {
      connection.release();
    }
    console.log(`Applied database migration: ${migrationName}`);
  }
}
