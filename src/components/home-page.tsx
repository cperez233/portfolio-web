import { existsSync } from "node:fs";
import path from "node:path";
import { AboutSection } from "@/components/about";
import { AuditSection } from "@/components/audit";
import { FaqSection } from "@/components/faq";
import { PricingSection } from "@/components/pricing";
import { MiniProjectsSection } from "@/components/mini-projects";
import { ProjectsSection } from "@/components/projects";
import Footer from "@/components/ui/footer-section";
import InteractiveVideoScroller from "@/components/ui/interactive-video-portfolio-scroller";
import PortfolioHero from "@/components/ui/portfolio-hero";
import { site } from "@/data/site";

/**
 * El CV solo se enlaza si el PDF esta en /public. La pagina es estatica,
 * asi que la comprobacion corre una vez, en el build: al anadir el
 * archivo, el enlace aparece en el siguiente deploy.
 */
function resolveCvHref(): string | null {
  const file = path.join(process.cwd(), "public", site.cvPath);
  return existsSync(file) ? site.cvPath : null;
}

/**
 * La pagina solo compone secciones. Cero markup de detalle. La usan las
 * dos versiones, app/(en)/page.tsx y app/(es)/es/page.tsx: el idioma lo
 * pone el LanguageProvider de cada layout.
 *
 * Los orbes ambientales solo quedan en Trabajo reciente, justo bajo el
 * hero: repetidos en cada seccion eran manchas de luz sin motivo.
 */
export function HomePage() {
  return (
    <main id="content" className="flex-1 overflow-x-clip">
      <PortfolioHero cvHref={resolveCvHref()} />
      <MiniProjectsSection />
      {/* La revision gratis va arriba: es el mejor gancho para quien aun no escribe. */}
      <AuditSection />
      <AboutSection />
      <InteractiveVideoScroller />
      <ProjectsSection />
      <PricingSection />
      <FaqSection />
      <Footer />
    </main>
  );
}
