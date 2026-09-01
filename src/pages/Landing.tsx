import { Hero } from "../components/home/Hero";
import { ProblemSection } from "../components/home/ProblemSection";
import { HowItWorks } from "../components/home/HowItWorks";
import { ModulesSection } from "../components/home/ModulesSection";
import { CTASection } from "../components/home/CTASection";
import { FAQSection } from "../components/home/FAQSection";

export function Landing() {
  return (
    <>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <ModulesSection />
      <CTASection />
      <FAQSection />
    </>
  );
}
