import { useCallback, useEffect, useState } from "react";
import { siteModel } from "../models/siteModel.js";

export function useAdminController() {
  const [setupRequired, setSetupRequired] = useState(false);
  const [token, setToken] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [admin, setAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);
  const [content, setContent] = useState({ settings: {}, services: [], gallery: [], videos: [], brands: [] });
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setStatus("loading");
    try {
      const savedToken = window.sessionStorage.getItem("sb-luxos-admin-token");
      if (savedToken) {
        try {
          const [session, nextContent, nextAdmins] = await Promise.all([
            siteModel.getSession(savedToken),
            siteModel.getContent(),
            siteModel.getAdmins(savedToken),
          ]);
          setToken(savedToken);
          setExpiresAt(session.expiresAt);
          setAdmin(session.admin);
          setAdmins(nextAdmins);
          setContent(nextContent);
          setSetupRequired(false);
          setStatus("ready");
          return;
        } catch (sessionError) {
          if (sessionError.status !== 401) throw sessionError;
          window.sessionStorage.removeItem("sb-luxos-admin-token");
          setToken("");
          setExpiresAt("");
          setAdmin(null);
          setAdmins([]);
        }
      }
      const [authStatus, nextContent] = await Promise.all([
        siteModel.getAuthStatus(),
        siteModel.getContent(),
      ]);
      setSetupRequired(authStatus.setupRequired);
      setContent(nextContent);
      setStatus("ready");
    } catch (loadError) {
      setError(loadError.message);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!expiresAt) return undefined;
    const remaining = new Date(expiresAt).getTime() - Date.now();
    const timer = window.setTimeout(() => {
      window.sessionStorage.removeItem("sb-luxos-admin-token");
      setToken("");
      setExpiresAt("");
      setAdmin(null);
      setAdmins([]);
      setError("A sessão expirou após 8 horas. Inicie sessão novamente.");
    }, Math.max(remaining, 0));
    return () => window.clearTimeout(timer);
  }, [expiresAt]);

  const authenticate = useCallback(async (email, password) => {
    setError("");
    try {
      const session = setupRequired
        ? await siteModel.setupAdmin(email, password)
        : await siteModel.login(email, password);
      const [nextContent, nextAdmins] = await Promise.all([
        siteModel.getContent(),
        siteModel.getAdmins(session.token),
      ]);
      setContent(nextContent);
      setAdmins(nextAdmins);
      window.sessionStorage.setItem("sb-luxos-admin-token", session.token);
      setToken(session.token);
      setExpiresAt(session.expiresAt);
      setAdmin(session.admin);
      setSetupRequired(false);
    } catch (authError) {
      setError(authError.message);
      throw authError;
    }
  }, [setupRequired]);

  const saveContent = useCallback(async (nextContent) => {
    setError("");
    try {
      const saved = await siteModel.saveContent(nextContent, token);
      setContent(saved);
      setError("");
      return saved;
    } catch (saveError) {
      setError(saveError.message);
      throw saveError;
    }
  }, [token]);

  const uploadMedia = useCallback((file, kind) => siteModel.uploadMedia(file, kind, token), [token]);

  const createAdmin = useCallback(async (email, password) => {
    setError("");
    try {
      await siteModel.createAdmin(email, password, token);
      setAdmins(await siteModel.getAdmins(token));
    } catch (createError) {
      setError(createError.message);
      throw createError;
    }
  }, [token]);

  const deleteAdmin = useCallback(async (id) => {
    setError("");
    try {
      await siteModel.removeAdmin(id, token);
      setAdmins(await siteModel.getAdmins(token));
    } catch (deleteError) {
      setError(deleteError.message);
      throw deleteError;
    }
  }, [token]);

  const logout = useCallback(async () => {
    try {
      await siteModel.logout(token);
    } finally {
      setToken("");
      window.sessionStorage.removeItem("sb-luxos-admin-token");
      setExpiresAt("");
      setAdmin(null);
      setAdmins([]);
    }
  }, [token]);

  return { setupRequired, authenticated: Boolean(token), admin, admins, expiresAt, content, status, error, authenticate, saveContent, uploadMedia, createAdmin, deleteAdmin, logout, refresh };
}
