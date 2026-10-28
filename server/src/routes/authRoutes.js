import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getAuthStatus, loginAdmin, setupAdmin } from "../controllers/authController.js";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
});

export function createAuthRouter(routes) {
  const router = Router();
  router.get(routes.authStatus, getAuthStatus);
  router.post(routes.authSetup, loginLimiter, setupAdmin);
  router.post(routes.authLogin, loginLimiter, loginAdmin);
  return router;
}
