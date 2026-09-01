import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useI18n } from "../../i18n";
import { useApplicant } from "../../context/ApplicantContext";
import { LanguageSelector } from "./LanguageSelector";
import { Button } from "../ui/Button";

const NAV = [
  { to: "/recommender", key: "navRecommender" as const },
  { to: "/apply", key: "navFindScheme" as const },
  { to: "/#how-it-works", key: "navHowItWorks" as const },
  { to: "/#faq", key: "navFaq" as const },
];

export function Navbar() {
  const { t } = useI18n();
  const { state } = useApplicant();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu when navigating.
  useEffect(() => setOpen(false), [location.pathname, location.hash]);

  const hasResults = Boolean(state.results?.length);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition ${
        scrolled ? "border-slate-200 bg-white/90 backdrop-blur" : "border-transparent bg-white/70 backdrop-blur"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2.5" aria-label="SchemeSaathi home">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">
            {t("brand")}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((item) => (
            <Link
              key={item.key}
              to={item.to}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSelector />
          {hasResults && (
            <Link to="/results">
              <Button variant="ghost">{t("navViewResults")}</Button>
            </Link>
          )}
          <Link to="/apply">
            <Button>{t("navFindScheme")}</Button>
          </Link>
        </div>

        <button
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {NAV.map((item) => (
              <Link
                key={item.key}
                to={item.to}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                {t(item.key)}
              </Link>
            ))}
            {hasResults && (
              <Link to="/results">
                <Button variant="ghost" className="mt-1 w-full">
                  {t("navViewResults")}
                </Button>
              </Link>
            )}
            <Link to="/apply" className="mt-1">
              <Button className="w-full">{t("navFindScheme")}</Button>
            </Link>
            <div className="mt-3">
              <LanguageSelector className="w-full" />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
