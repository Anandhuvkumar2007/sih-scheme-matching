import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../../i18n";
import { Button } from "../ui/Button";
import { Reveal } from "../ui/Reveal";

export function CTASection() {
  const { t } = useI18n();
  return (
    <section className="bg-ink-900 py-16 text-center">
      <div className="container-page">
        <Reveal>
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            {t("ctaTitle")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-lg text-slate-300">{t("ctaSubtitle")}</p>
          <Link to="/apply" className="mt-8 inline-block">
            <Button className="px-8 py-3.5 text-base">
              {t("ctaBtn")}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
