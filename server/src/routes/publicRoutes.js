import { Router } from "express";
import rateLimit from "express-rate-limit";
import { createQuote, readContent } from "../controllers/siteController.js";

const quoteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitos pedidos. Aguarde alguns minutos e tente novamente." },
});

export function createPublicRouter({ contentRoute, quoteRoute }) {
  const router = Router();
  router.get(contentRoute, readContent);
  router.post(quoteRoute, quoteLimiter, createQuote);
  return router;
}
