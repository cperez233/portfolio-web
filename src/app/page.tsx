import { AboutSection } from "@/components/about";
import { MarqueeSection } from "@/components/marquee-section";
import { ProjectsSection } from "@/components/projects";
import Footer from "@/components/ui/footer-section";
import InteractiveVideoScroller from "@/components/ui/interactive-video-portfolio-scroller";
import PortfolioHero from "@/components/ui/portfolio-hero";

/**
 * La pagina solo compone secciones. Cero markup de detalle.
 */
export default function Home() {
  return (
    <main id="content" className="flex-1 overflow-x-clip">
      <PortfolioHero />
      <MarqueeSection />
      <AboutSection />
      <InteractiveVideoScroller />
      <ProjectsSection />
      <Footer />
    </main>
  );
}
