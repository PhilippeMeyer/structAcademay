import { useState, useCallback } from "react";

export function useProgress() {
  const [visited, setVisited] = useState(() => {
    try {
      const stored = localStorage.getItem("sp_trainer_progress");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  });

  const markVisited = useCallback((id) => {
    setVisited(prev => {
      const next = { ...prev, [id]: true };
      try { localStorage.setItem("sp_trainer_progress", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setVisited({});
    try { localStorage.removeItem("sp_trainer_progress"); } catch {}
  }, []);

  return { visited, markVisited, reset };
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
