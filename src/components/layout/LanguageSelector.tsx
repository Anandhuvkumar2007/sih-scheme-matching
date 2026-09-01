import { Globe } from "lucide-react";
import { LANGUAGES, LANGUAGE_NAMES, useI18n } from "../../i18n";
import type { Language } from "../../types";

/** Native <select> language switcher — accessible & keyboard-friendly. */
export function LanguageSelector({ className = "" }: { className?: string }) {
  const { lang, setLang } = useI18n();

  return (
    <div className={`relative inline-flex items-center gap-1.5 ${className}`}>
      <Globe className="h-4 w-4 text-slate-500" aria-hidden />
      <label className="sr-only" htmlFor="lang-select">
        Select language
      </label>
      <select
        id="lang-select"
        value={lang}
        onChange={(e) => setLang(e.target.value as Language)}
        className="cursor-pointer rounded-lg border border-slate-300 bg-white py-1.5 pl-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-100"
      >
        {LANGUAGES.map((l) => (
          <option key={l} value={l}>
            {LANGUAGE_NAMES[l]}
          </option>
        ))}
      </select>
    </div>
  );
}
