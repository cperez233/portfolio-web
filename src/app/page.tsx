import PortfolioHero from "@/components/ui/portfolio-hero";
import { CallToAction, Process } from "@/components/sections";

/**
 * Directriz 5: la pagina solo compone secciones. Cero markup de detalle.
 */
export default function Home() {
  return (
    <main id="contenido" className="flex-1">
      <PortfolioHero />
      <Process />
      <CallToAction />
    </main>
  );
}
