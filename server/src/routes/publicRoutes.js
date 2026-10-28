import { Router } from "express";
import { createQuote, readContent } from "../controllers/siteController.js";

export function createPublicRouter({ contentRoute, quoteRoute }) {
  const router = Router();
  router.get(contentRoute, readContent);
  router.post(quoteRoute, createQuote);
  return router;
}
