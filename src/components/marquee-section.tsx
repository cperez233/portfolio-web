"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { marqueeTechnologies } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { BackgroundOrbs } from "./ui/background-orbs";
import { SectionEdge, SectionTransition } from "./ui/section-transition";
import { cn } from "@/lib/utils";

/**
 * Banda de transicion entre el hero y el resto. Dos filas de texto que
 * se desplazan en sentidos opuestos segun la posicion del scroll.
 *
 * Arriba, en grande, lo que se lleva quien contrata. Abajo, en mono y
 * mas discreto, el stack: la misma jerarquia de dos capas que el resto
 * del sitio, lo llano delante y el detalle tecnico un paso por detras.
 *
 * Antes habia dos filas de imagenes. Las de plantillas ajenas no eran
 * suyas; las de trabajo propio repetian la seccion de Proyectos, que
 * esta a un scroll de distancia y las ensena mejor.
 *
 * Cada fila se recorta con overflow-x-clip: sin eso, las filas
 * trasladadas arrastrarian scroll horizontal a toda la pagina.
 */
export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(200);
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handleScroll = () => {
      const element = sectionRef.current;
      if (!element) return;

      const sectionTop = element.getBoundingClientRect().top + window.scrollY;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [shouldReduceMotion]);

  const shift = offset - 200;

  return (
    <section
      ref={sectionRef}
      aria-label="Highlights"
      className="layer-top relative z-10 overflow-x-clip rounded-t-[32px] bg-canvas py-16 transition-colors duration-500 sm:rounded-t-[48px] sm:py-24"
    >
      <SectionEdge />
      <BackgroundOrbs variant="top" />

      <SectionTransition className="relative z-10">
        <Row translateX={shift}>
          {t.marqueePhrases.map((phrase, index) => (
            <Item
              key={`${phrase}-${index}`}
              className={cn(
                // 4xl y no 5xl: a mas tamano solo caben dos palabras en
                // pantalla y la frase deja de leerse como frase.
                "text-2xl font-medium tracking-tight sm:text-4xl",
                // Alternar acento da ritmo sin pintar la fila entera.
                index % 2 === 0 ? "text-ink" : "text-accent-ink",
              )}
            >
              {phrase}
            </Item>
          ))}
        </Row>

        <Row translateX={-shift} className="mt-6 sm:mt-8">
          {marqueeTechnologies.map((tech, index) => (
            <Item
              key={`${tech}-${index}`}
              className="font-mono text-sm uppercase tracking-[0.18em] text-ink-subtle sm:text-base"
              dotClassName="size-1"
            >
              {tech}
            </Item>
          ))}
        </Row>
      </SectionTransition>
    </section>
  );
}

/**
 * Una fila. El contenido se repite tres veces para que el desplazamiento
 * nunca deje un hueco visible por ninguno de los dos lados.
 */
function Row({
  children,
  translateX,
  className,
}: {
  children: React.ReactNode;
  translateX: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("marquee-fade overflow-x-clip", className)}
    >
      <div
        className="flex w-max items-center"
        style={{
          transform: `translateX(${translateX}px)`,
          willChange: "transform",
        }}
      >
        {children}
        {children}
        {children}
      </div>
    </div>
  );
}

function Item({
  children,
  className,
  dotClassName,
}: {
  children: React.ReactNode;
  className?: string;
  dotClassName?: string;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center gap-6 whitespace-nowrap sm:gap-10",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "shrink-0 rounded-full bg-accent-ink/60",
          dotClassName ?? "size-1.5",
        )}
      />
    </span>
  );
}
