import { Router } from "express";
import { saveSiteContent } from "../controllers/siteController.js";
import { logoutAdmin } from "../controllers/authController.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { uploadImage, uploadVideo } from "../middleware/uploadMedia.js";
import { saveUploadedMedia } from "../controllers/uploadController.js";
import { createAdminAccount, deleteAdminAccount, readAdmins } from "../controllers/adminAccountsController.js";

export function createAdminRouter(routes) {
  const router = Router();
  router.use(requireAdmin);
  router.post(`${routes.upload}/image`, uploadImage, saveUploadedMedia);
  router.post(`${routes.upload}/video`, uploadVideo, saveUploadedMedia);
  router.get(routes.adminAccounts, readAdmins);
  router.post(routes.adminAccounts, createAdminAccount);
  router.delete(`${routes.adminAccounts}/:id`, deleteAdminAccount);
  router.put(routes.adminContent, saveSiteContent);
  router.delete(routes.adminSession, logoutAdmin);
  return router;
}
