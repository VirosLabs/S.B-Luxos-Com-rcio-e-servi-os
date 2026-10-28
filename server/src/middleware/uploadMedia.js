import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import { config } from "../config/env.js";

const imageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
  ["image/avif", ".avif"],
]);
const videoTypes = new Map([
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/quicktime", ".mov"],
]);

function createUploader(allowedTypes, maxFileSize) {
  const storage = multer.diskStorage({
    async destination(_request, _file, callback) {
      try {
        await fs.mkdir(config.mediaDirectory, { recursive: true });
        callback(null, config.mediaDirectory);
      } catch (error) {
        callback(error);
      }
    },
    filename(_request, file, callback) {
      const extension = allowedTypes.get(file.mimetype);
      if (!extension) {
        return callback(new Error("O tipo de ficheiro não é suportado."));
      }
      return callback(null, `${randomUUID()}${extension}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxFileSize, files: 1, fields: 0 },
    fileFilter(_request, file, callback) {
      if (!allowedTypes.has(file.mimetype)) {
        return callback(new Error("Formato não suportado. Selecione uma imagem ou vídeo compatível."));
      }
      return callback(null, true);
    },
  }).single("file");
}

export const uploadImage = createUploader(imageTypes, 15 * 1024 * 1024);
export const uploadVideo = createUploader(videoTypes, 150 * 1024 * 1024);
