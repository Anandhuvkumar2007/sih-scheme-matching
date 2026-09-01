import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "../../i18n";
import { SectionHeading } from "../ui/SectionHeading";
import { Reveal } from "../ui/Reveal";
import { FAQ_ITEMS } from "../../data/faq";

export function FAQSection() {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white py-16 sm:py-24">
      <div className="container-page max-w-3xl">
        <Reveal>
          <SectionHeading title={t("faqTitle")} subtitle={t("faqSubtitle")} />
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ_ITEMS.map((item, i) => {
            const expanded = open === i;
            return (
              <Reveal key={i} delay={i * 40}>
                <div className="card overflow-hidden">
                  <button
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                    onClick={() => setOpen(expanded ? null : i)}
                    aria-expanded={expanded}
                  >
                    <span className="font-semibold text-slate-800">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expanded && (
                    <div className="border-t border-slate-100 px-5 py-4 text-sm text-slate-600">
                      {item.answer}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
