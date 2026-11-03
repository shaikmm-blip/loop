import IntroAnimation from "@/components/ui/scroll-morph-hero";
import { FinalCTA, Footer, GoneCold, HowItWorks, LandingNav, Pricing } from "@/components/landing";

export default function Home() {
  return (
    <main>
      <LandingNav />
      <section className="relative h-screen w-full">
        <IntroAnimation nextSectionId="gone-cold" />
      </section>
      <GoneCold />
      <HowItWorks />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
