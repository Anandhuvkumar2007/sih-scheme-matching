import { Link } from "react-router-dom";
import { ShieldCheck, Info } from "lucide-react";
import { useI18n } from "../../i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="bg-ink-900 text-slate-300">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-lg font-extrabold text-white">SchemeSaathi</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-slate-400">{t("footerTag")}</p>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t("footerProduct")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/recommender" className="hover:text-white">{t("navRecommender")}</Link></li>
            <li><Link to="/apply" className="hover:text-white">{t("navFindScheme")}</Link></li>
            <li><Link to="/#how-it-works" className="hover:text-white">{t("navHowItWorks")}</Link></li>
            <li><Link to="/#faq" className="hover:text-white">{t("navFaq")}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            {t("footerResources")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/apply" className="hover:text-white">{t("btnTryDemo")}</Link></li>
            <li><Link to="/#modules" className="hover:text-white">{t("modulesSubtitle")}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page py-6 text-xs text-slate-400">
          <p className="flex items-start gap-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>{t("disclaimer")}</span>
          </p>
          <p className="mt-3">
            {t("footerMadeFor")} — {t("footerDemo")}. © {new Date().getFullYear()} SchemeSaathi.
          </p>
        </div>
      </div>
    </footer>
  );
}
