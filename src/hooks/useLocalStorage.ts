// ============================================================================
// useLocalStorage — persist a piece of React state to localStorage so it
// survives a page refresh (used to keep the guided flow across routes).
// ============================================================================

import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored != null ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore storage errors (e.g. private mode) */
    }
  }, [key, value]);

  return [value, setValue] as const;
}
