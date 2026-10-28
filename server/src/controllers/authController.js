import { authenticateAdmin, createAdmin, endSession, hasAdmin } from "../models/adminModel.js";

export async function getAuthStatus(_request, response, next) {
  try {
    response.json({ setupRequired: !(await hasAdmin()) });
  } catch (error) {
    next(error);
  }
}

export async function setupAdmin(request, response, next) {
  try {
    const session = await createAdmin(request.body?.email, request.body?.password);
    response.status(201).json(session);
  } catch (error) {
    if (error.status) return response.status(error.status).json({ error: error.message });
    next(error);
  }
}

export async function loginAdmin(request, response, next) {
  try {
    if (typeof request.body?.email !== "string" || typeof request.body?.password !== "string") {
      return response.status(400).json({ error: "Indique o e-mail e a senha de administrador." });
    }
    response.json(await authenticateAdmin(request.body.email, request.body.password));
  } catch (error) {
    if (error.status) return response.status(error.status).json({ error: error.message });
    next(error);
  }
}

export function logoutAdmin(request, response) {
  endSession(request.adminToken);
  response.status(204).end();
}
