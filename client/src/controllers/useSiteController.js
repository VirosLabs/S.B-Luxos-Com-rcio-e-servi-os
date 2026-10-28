import { useCallback, useEffect, useState } from "react";
import { defaultSiteSettings, siteModel } from "../models/siteModel.js";

export function useSiteController() {
  const [content, setContent] = useState({ settings: defaultSiteSettings, services: [], gallery: [], videos: [], brands: [] });
  const [loading, setLoading] = useState(true);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    let active = true;
    siteModel.getContent()
      .then((result) => {
        if (active) setContent(result);
      })
      .catch((error) => {
        if (active) setContentError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const submitQuote = useCallback((quote) => siteModel.createQuote(quote), []);
  return { content, loading, contentError, submitQuote };
}
