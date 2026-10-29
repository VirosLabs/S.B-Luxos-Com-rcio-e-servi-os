import mysql from "mysql2/promise";
import { config } from "../config/env.js";

let pool;

function createPoolFromUrl(databaseUrl) {
  let url;
  try {
    url = new URL(databaseUrl);
  } catch {
    throw new Error("DATABASE_URL em server/.env não contém um URL válido do MySQL.");
  }

  if (url.protocol !== "mysql:" && url.protocol !== "mysqls:") {
    throw new Error("DATABASE_URL deve usar o protocolo mysql:// ou mysqls://.");
  }
  if (!url.hostname || !url.pathname || url.pathname === "/") {
    throw new Error("DATABASE_URL precisa de host e nome da base de dados.");
  }

  const useTls = url.protocol === "mysqls:" || url.searchParams.get("ssl") === "true";
  return mysql.createPool({
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: decodeURIComponent(url.pathname.slice(1)),
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: 0,
    ssl: useTls ? { rejectUnauthorized: true } : undefined,
    timezone: "Z",
  });
}

export async function connectDatabase() {
  if (!config.databaseUrl) {
    throw new Error(
      "DATABASE_URL não está configurada. Defina-a em server/.env com a URL da sua base de dados MySQL.",
    );
  }
  if (!pool) pool = createPoolFromUrl(config.databaseUrl);

  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
  return pool;
}

export function getPool() {
  if (!pool) throw new Error("A base de dados ainda não foi inicializada.");
  return pool;
}

const retryableConnectionErrors = new Set([
  "ECONNRESET",
  "ECONNREFUSED",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "PROTOCOL_CONNECTION_LOST",
]);

export async function executeRead(sql, values = []) {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await getPool().execute(sql, values);
    } catch (error) {
      if (attempt > 0 || !retryableConnectionErrors.has(error.code)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
}

export async function closeDatabase() {
  if (!pool) return;
  const currentPool = pool;
  pool = undefined;
  await currentPool.end();
}
