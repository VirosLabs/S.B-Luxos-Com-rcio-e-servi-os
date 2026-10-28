import { closeDatabase, connectDatabase } from "./pool.js";
import { runMigrations } from "./migrate.js";

try {
  await connectDatabase();
  await runMigrations();
  console.log("Database migrations are up to date.");
} catch (error) {
  console.error("Could not run database migrations:", error);
  process.exitCode = 1;
} finally {
  await closeDatabase();
}
