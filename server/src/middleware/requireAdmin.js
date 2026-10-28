import { getSession } from "../models/adminModel.js";

export function requireAdmin(request, response, next) {
  const authorization = request.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";

  const session = token ? getSession(token) : null;
  if (!session) {
    return response.status(401).json({ error: "Inicie sessão de administrador para continuar." });
  }
  request.adminToken = token;
  request.admin = session;
  return next();
}
