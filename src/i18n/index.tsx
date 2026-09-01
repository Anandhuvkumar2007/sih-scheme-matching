// ============================================================================
// Lightweight i18n system (no external library).
//
// Language dictionaries live in en.ts / ml.ts / hi.ts. Each is a map of the
// same message keys. `MessageKey` is derived from the English dictionary, so
// TypeScript will flag any key you try to use that doesn't exist.
//
// To add another language:
//   1. create a new file, e.g. ta.ts:  export const ta: Partial<Messages> = {...}
//   2. register it in `translations` and `LANGUAGES` below.
// That's it — the whole UI picks it up.
// ============================================================================

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { en, type Messages } from "./en";
import { ml } from "./ml";
import { hi } from "./hi";
import type { Language } from "../types";

/** Every registered language dictionary, keyed by language code. */
const translations: Record<Language, Partial<Messages>> = { en, ml, hi };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: "English",
  ml: "മലയാളം",
  hi: "हिन्दी",
};

export const LANGUAGES: Language[] = ["en", "ml", "hi"];

export type MessageKey = keyof Messages;

interface I18nContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  /** Translate a message key, falling back to English when untranslated. */
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("schemesaathi.lang");
      return (LANGUAGES.includes(saved as Language) ? saved : "en") as Language;
    } catch {
      return "en";
    }
  });

  const setLangAndPersist = (l: Language) => {
    setLang(l);
    try {
      localStorage.setItem("schemesaathi.lang", l);
    } catch {
      /* ignore storage errors */
    }
  };

  const value = useMemo<I18nContextValue>(() => {
    const dict = translations[lang];
    const t = (key: MessageKey): string => dict[key] ?? en[key] ?? key;
    return { lang, setLang: setLangAndPersist, t };
  }, [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within an I18nProvider");
  return ctx;
}
