import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
export const serverDirectory = path.resolve(currentDirectory, "../..");
export const projectDirectory = path.resolve(serverDirectory, "..");

dotenv.config({ path: path.join(serverDirectory, ".env") });

function routePart(value, fallback) {
  const route = value || fallback;
  if (!route.startsWith("/") || route.startsWith("//")) {
    throw new Error(`Route must start with one slash: ${route}`);
  }
  return route.replace(/\/+$/, "") || "/";
}

const apiPrefix = routePart(process.env.API_PREFIX, "/api");

export const config = {
  port: Number(process.env.PORT) || 3001,
  databaseUrl: process.env.DATABASE_URL || "",
  mediaDirectory: path.resolve(projectDirectory, process.env.MEDIA_DIRECTORY || "server/uploads"),
  mediaRoute: routePart(process.env.MEDIA_ROUTE, "/uploads"),
  whatsappNumber: process.env.WHATSAPP_NUMBER || "244947655469",
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  clientBuildDirectory: path.join(projectDirectory, "client", "dist"),
  apiPrefix,
  routes: {
    content: routePart(process.env.CONTENT_ROUTE, "/content"),
    quote: routePart(process.env.QUOTE_ROUTE, "/quote"),
    auth: routePart(process.env.AUTH_ROUTE, "/auth"),
    admin: routePart(process.env.ADMIN_ROUTE, "/admin"),
    authStatus: routePart(process.env.AUTH_STATUS_ROUTE, "/status"),
    authSetup: routePart(process.env.AUTH_SETUP_ROUTE, "/setup"),
    authLogin: routePart(process.env.AUTH_LOGIN_ROUTE, "/login"),
    adminContent: routePart(process.env.ADMIN_CONTENT_ROUTE, "/content"),
    adminSession: routePart(process.env.ADMIN_SESSION_ROUTE, "/session"),
    adminAccounts: routePart(process.env.ADMIN_ACCOUNTS_ROUTE, "/admins"),
    upload: routePart(process.env.UPLOAD_ROUTE, "/upload"),
  },
};

export function apiRoute(route) {
  return `${config.apiPrefix}${route === "/" ? "" : route}`;
}
