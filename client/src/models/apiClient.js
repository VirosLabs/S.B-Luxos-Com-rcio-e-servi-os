const defaultApiUrl = import.meta.env.PROD ? window.location.origin : "http://localhost:3001";
const apiBase = `${import.meta.env.VITE_API_URL || defaultApiUrl}${import.meta.env.VITE_API_PREFIX || "/api"}`;
export const apiOrigin = new URL(apiBase).origin;

export const apiRoutes = {
  content: import.meta.env.VITE_CONTENT_ROUTE || "/content",
  quote: import.meta.env.VITE_QUOTE_ROUTE || "/quote",
  auth: import.meta.env.VITE_AUTH_ROUTE || "/auth",
  admin: import.meta.env.VITE_ADMIN_ROUTE || "/admin",
  authStatus: import.meta.env.VITE_AUTH_STATUS_ROUTE || "/status",
  authSetup: import.meta.env.VITE_AUTH_SETUP_ROUTE || "/setup",
  authLogin: import.meta.env.VITE_AUTH_LOGIN_ROUTE || "/login",
  adminContent: import.meta.env.VITE_ADMIN_CONTENT_ROUTE || "/content",
  adminSession: import.meta.env.VITE_ADMIN_SESSION_ROUTE || "/session",
  adminAccounts: import.meta.env.VITE_ADMIN_ACCOUNTS_ROUTE || "/admins",
  upload: import.meta.env.VITE_UPLOAD_ROUTE || "/upload",
  media: import.meta.env.VITE_MEDIA_ROUTE || "/uploads",
};

async function parseResponse(response) {
  if (response.status === 204) return null;
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Ocorreu um erro. Tente novamente.");
  }
  if (!response.ok) {
    const error = new Error(payload?.error || "Ocorreu um erro. Tente novamente.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function fetchResponse(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error("Não foi possível contactar a API. Verifique se o servidor está ligado e tente novamente.");
  }
}

export async function apiRequest(route, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetchResponse(`${apiBase}${route}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return parseResponse(response);
}

export async function uploadMediaFile(file, kind, token) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetchResponse(`${apiBase}${apiRoutes.admin}${apiRoutes.upload}/${kind}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return parseResponse(response);
}

export function isUploadedMedia(mediaUrl) {
  if (typeof mediaUrl !== "string" || !mediaUrl) return false;
  const mediaPrefix = `${apiRoutes.media}/`;
  const filename = mediaUrl.startsWith(mediaPrefix) ? mediaUrl.slice(mediaPrefix.length) : mediaUrl;
  return /^[a-f0-9-]{36}\.(jpg|png|webp|gif|avif|mp4|webm|mov)$/i.test(filename);
}

export function resolveMediaUrl(mediaUrl) {
  if (typeof mediaUrl !== "string" || !mediaUrl) return "";
  const uploadedFilename = isUploadedMedia(mediaUrl) && !mediaUrl.startsWith(`${apiRoutes.media}/`);
  const mediaPath = uploadedFilename ? `${apiRoutes.media}/${mediaUrl}` : mediaUrl;
  return mediaPath.startsWith(`${apiRoutes.media}/`) ? `${apiOrigin}${mediaPath}` : mediaPath;
}
