import express from "express";
import cors from "cors";
import path from "node:path";
import { config, apiRoute, projectDirectory } from "./config/env.js";
import { createAuthRouter } from "./routes/authRoutes.js";
import { createPublicRouter } from "./routes/publicRoutes.js";
import { createAdminRouter } from "./routes/adminRoutes.js";
import { connectDatabase, closeDatabase } from "./database/pool.js";
import { runMigrations } from "./database/migrate.js";

const app = express();

app.use(cors({
  origin(origin, callback) {
    if (!origin || config.clientOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("A origem não está autorizada pelo CORS."));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 86400,
}));
app.use(express.json({ limit: "100kb" }));

app.use(apiRoute("/"), createPublicRouter({
  contentRoute: config.routes.content,
  quoteRoute: config.routes.quote,
}));
app.use(apiRoute(config.routes.auth), createAuthRouter(config.routes));
app.use(apiRoute(config.routes.admin), createAdminRouter(config.routes));

app.use(config.mediaRoute, express.static(config.mediaDirectory, {
  index: false,
  fallthrough: false,
  setHeaders(response) {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  },
}));
app.use(express.static(path.resolve(projectDirectory, "client", "dist")));
app.get("*", (_request, response, next) => {
  response.sendFile(path.join(config.clientBuildDirectory, "index.html"), (error) => {
    if (error) next();
  });
});

app.use((error, _request, response, _next) => {
  if (["ECONNRESET", "ECONNREFUSED", "ETIMEDOUT", "EHOSTUNREACH", "PROTOCOL_CONNECTION_LOST"].includes(error.code)) {
    console.error("The database connection failed:", error.code);
    return response.status(503).json({ error: "A base de dados está temporariamente indisponível. Tente novamente." });
  }
  if (error.status === 404) {
    return response.status(404).json({ error: "O ficheiro pedido não foi encontrado." });
  }
  if (error instanceof URIError) {
    return response.status(400).json({ error: "O endereço pedido não é válido." });
  }
  if (error.code === "LIMIT_FILE_SIZE") {
    return response.status(413).json({ error: "O ficheiro excede o limite permitido para este tipo de mídia." });
  }
  if (["EACCES", "ENOSPC", "EROFS"].includes(error.code)) {
    return response.status(507).json({ error: "O servidor não conseguiu guardar o ficheiro. Verifique as permissões e o espaço disponível no armazenamento." });
  }
  if (error.code === "LIMIT_UNEXPECTED_FILE" || error.message.includes("Formato não suportado") || error.message.includes("tipo de ficheiro")) {
    return response.status(400).json({ error: error.message });
  }
  console.error(error);
  if (response.headersSent) return;
  response.status(500).json({ error: "Ocorreu um erro interno. Tente novamente." });
});

async function startServer() {
  await connectDatabase();
  await runMigrations();
  const server = app.listen(config.port, () => {
    console.log(`S.B Luxos API running at http://localhost:${config.port}${config.apiPrefix}`);
  });

  for (const signal of ["SIGINT", "SIGTERM"]) {
    process.once(signal, () => {
      server.close(() => {
        closeDatabase()
          .then(() => process.exit(0))
          .catch((error) => {
            console.error("Could not close the database pool cleanly:", error);
            process.exit(1);
          });
      });
    });
  }
}

startServer().catch(async (error) => {
  console.error("Could not start the S.B Luxos API:", error);
  try {
    await closeDatabase();
  } catch (closeError) {
    console.error("Could not close the database pool:", closeError);
  }
  process.exitCode = 1;
});
