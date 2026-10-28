import fs from "node:fs/promises";
import path from "node:path";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { projectDirectory } from "../config/env.js";
import { getPool } from "../database/pool.js";

const scrypt = promisify(scryptCallback);
const legacyFilePath = path.join(projectDirectory, "server", "data", "admin.json");
const sessions = new Map();
const sessionLifetimeMs = 8 * 60 * 60 * 1000;

function validateCredentials(email, password) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
    const error = new Error("Indique um endereço de e-mail válido.");
    error.status = 400;
    throw error;
  }
  if (typeof password !== "string" || password.length < 12 || password.length > 200) {
    const error = new Error("A senha deve ter entre 12 e 200 caracteres.");
    error.status = 400;
    throw error;
  }
  return normalizedEmail;
}

async function passwordHash(password, salt) {
  const derivedKey = await scrypt(password, salt, 64);
  return derivedKey.toString("hex");
}

async function insertAdmin(email, password, setupAccount = false) {
  const normalizedEmail = validateCredentials(email, password);
  const salt = randomBytes(16).toString("hex");
  const hash = await passwordHash(password, salt);
  try {
    const [result] = setupAccount
      ? await getPool().execute(
        "INSERT INTO admin_accounts (id, email, salt, password_hash) VALUES (1, ?, ?, ?)",
        [normalizedEmail, salt, hash],
      )
      : await getPool().execute(
        "INSERT INTO admin_accounts (email, salt, password_hash) VALUES (?, ?, ?)",
        [normalizedEmail, salt, hash],
      );
    return { id: result.insertId, email: normalizedEmail };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      const conflictError = new Error("Já existe uma conta de administrador com esse e-mail.");
      conflictError.status = 409;
      throw conflictError;
    }
    throw error;
  }
}

export async function hasAdmin() {
  const pool = getPool();
  const [rows] = await pool.execute("SELECT id FROM admin_accounts LIMIT 1");
  if (rows.length) return true;

  const credentials = await readLegacyCredentials();
  if (!credentials) return false;
  await pool.execute(
    `INSERT INTO admin_accounts (id, email, salt, password_hash)
     VALUES (1, 'sbluxoscomercioeservicoso@gmail.com', ?, ?)
     ON DUPLICATE KEY UPDATE id = id`,
    [credentials.salt, credentials.passwordHash],
  );
  return true;
}

export async function createAdmin(email, password) {
  if (await hasAdmin()) {
    const error = new Error("Já existe uma conta. Inicie sessão para adicionar outros administradores.");
    error.status = 409;
    throw error;
  }
  const admin = await insertAdmin(email, password, true);
  return createSession(admin);
}

export async function authenticateAdmin(email, password) {
  const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
      typeof password !== "string" || password.length < 1 || password.length > 200) {
    const error = new Error("O e-mail ou a senha estão incorretos.");
    error.status = 401;
    throw error;
  }

  const [rows] = await getPool().execute(
    "SELECT id, email, salt, password_hash FROM admin_accounts WHERE email = ?",
    [normalizedEmail],
  );
  if (!rows.length) {
    const error = new Error("O e-mail ou a senha estão incorretos.");
    error.status = 401;
    throw error;
  }

  const credentials = rows[0];
  const derivedKey = Buffer.from(await passwordHash(password, credentials.salt), "hex");
  const expected = Buffer.from(credentials.password_hash, "hex");
  if (expected.length !== derivedKey.length || !timingSafeEqual(expected, derivedKey)) {
    const error = new Error("O e-mail ou a senha estão incorretos.");
    error.status = 401;
    throw error;
  }
  return createSession({ id: credentials.id, email: credentials.email });
}

export async function listAdmins() {
  const [rows] = await getPool().execute(
    "SELECT id, email, created_at AS createdAt FROM admin_accounts ORDER BY id",
  );
  return rows;
}

export async function addAdmin(email, password) {
  return insertAdmin(email, password);
}

export async function removeAdmin(id, currentAdminId) {
  const adminId = Number(id);
  if (!Number.isSafeInteger(adminId) || adminId < 1) {
    const error = new Error("A conta indicada é inválida.");
    error.status = 400;
    throw error;
  }
  if (adminId === Number(currentAdminId)) {
    const error = new Error("Não pode remover a conta que está a usar.");
    error.status = 400;
    throw error;
  }

  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      "SELECT id FROM admin_accounts ORDER BY id FOR UPDATE",
    );
    if (!rows.some((row) => Number(row.id) === adminId)) {
      const error = new Error("A conta de administrador não foi encontrada.");
      error.status = 404;
      throw error;
    }
    if (rows.length <= 1) {
      const error = new Error("O último administrador não pode ser removido.");
      error.status = 409;
      throw error;
    }
    await connection.execute("DELETE FROM admin_accounts WHERE id = ?", [adminId]);
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
  for (const [token, session] of sessions) {
    if (session.id === adminId) sessions.delete(token);
  }
}

function createSession(admin) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + sessionLifetimeMs;
  sessions.set(token, { id: Number(admin.id), email: admin.email, expiresAt });
  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
    expiresIn: sessionLifetimeMs,
    admin: { id: Number(admin.id), email: admin.email },
  };
}

export function getSession(token) {
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { id: session.id, email: session.email, expiresAt: session.expiresAt };
}

export function endSession(token) {
  sessions.delete(token);
}

async function readLegacyCredentials() {
  try {
    const credentials = JSON.parse(await fs.readFile(legacyFilePath, "utf8"));
    if (
      typeof credentials.salt !== "string" ||
      typeof credentials.passwordHash !== "string" ||
      !/^[a-f0-9]{32}$/i.test(credentials.salt) ||
      !/^[a-f0-9]{128}$/i.test(credentials.passwordHash)
    ) {
      throw new Error("O ficheiro de credenciais administrativas antigo está inválido.");
    }
    return credentials;
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}
