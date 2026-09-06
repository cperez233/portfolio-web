import { CallToAction, Hero, Process } from "@/components/sections";

/**
 * Directriz 5: la pagina solo compone secciones. Cero markup de detalle.
 */
export default function Home() {
  return (
    <main id="contenido" className="flex-1">
      <Hero />
      <Process />
      <CallToAction />
    </main>
  );
}
