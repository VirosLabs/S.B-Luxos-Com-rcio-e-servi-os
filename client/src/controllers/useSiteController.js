import { useCallback, useEffect, useState } from "react";
import { defaultSiteSettings, siteModel } from "../models/siteModel.js";

export function useSiteController() {
  const [content, setContent] = useState({ settings: defaultSiteSettings, services: [], gallery: [], videos: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadContent() {
      try {
        const result = await siteModel.getContent();
        if (active) {
          setContent(result);
          setContentError("");
        }
      } catch (error) {
        if (active) setContentError(error.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    const refreshWhenVisible = () => {
      if (!document.hidden) loadContent();
    };
    loadContent();
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const submitQuote = useCallback((quote) => siteModel.createQuote(quote), []);
  return { content, loading, contentError, submitQuote };
}
