import {
  About,
  HeroHybrid,
  MarqueeShowcase,
  Projects,
  Services,
} from "@/components/sections";

/**
 * Directriz 5: la pagina solo compone secciones. Cero markup de detalle.
 */
export default function Home() {
  return (
    <main id="contenido" className="flex-1 overflow-x-clip">
      <HeroHybrid />
      <MarqueeShowcase />
      <About />
      <Services />
      <Projects />
    </main>
  );
}
