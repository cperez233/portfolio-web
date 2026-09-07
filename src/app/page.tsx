import { AboutSection } from "@/components/about";
import { MarqueeSection } from "@/components/marquee-section";
import { ProjectsSection } from "@/components/projects";
import Footer from "@/components/ui/footer-section";
import InteractiveVideoScroller from "@/components/ui/interactive-video-portfolio-scroller";
import PortfolioHero from "@/components/ui/portfolio-hero";
import { SectionBubbles } from "@/components/ui/section-bubbles";

/**
 * La pagina solo compone secciones. Cero markup de detalle.
 *
 * Los <SectionBubbles /> son cortes ambientales entre bloques: evitan
 * que los cambios de seccion queden planos sin robar protagonismo.
 */
export default function Home() {
  return (
    <main id="content" className="flex-1 overflow-x-clip">
      <PortfolioHero />
      <MarqueeSection />
      <SectionBubbles />
      <AboutSection />
      <SectionBubbles height="sm" />
      <InteractiveVideoScroller />
      <ProjectsSection />
      <SectionBubbles height="sm" />
      <Footer />
    </main>
  );
}
