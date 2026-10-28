import { config } from "../config/env.js";

export function saveUploadedMedia(request, response) {
  if (!request.file) {
    return response.status(400).json({ error: "Selecione um ficheiro para carregar." });
  }
  return response.status(201).json({
    url: `${config.mediaRoute}/${request.file.filename}`,
    size: request.file.size,
    contentType: request.file.mimetype,
  });
}
