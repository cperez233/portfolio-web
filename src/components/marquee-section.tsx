"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { marqueeRowOne } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { BackgroundOrbs } from "./ui/background-orbs";
import { SectionEdge, SectionTransition } from "./ui/section-transition";

/**
 * Dos filas que se desplazan en sentidos opuestos segun la posicion del
 * scroll. Listener pasivo y solo se toca transform.
 *
 * Arriba, capturas del trabajo real; abajo, una fila de texto con lo que
 * el visitante se lleva. Antes las dos filas eran GIFs de plantillas de
 * terceros: se veian bien, pero no eran suyas y no decian nada.
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
      aria-label="Work showcase"
      className="layer-top relative z-10 overflow-x-clip rounded-t-[32px] bg-canvas pb-14 pt-20 transition-colors duration-500 sm:rounded-t-[48px] sm:pt-28 md:pt-32"
    >
      <SectionEdge />
      <BackgroundOrbs variant="top" />

      <SectionTransition className="relative z-10">
        <ImageRow
          sources={[...marqueeRowOne, ...marqueeRowOne]}
          translateX={shift}
        />
        <PhraseRow
          phrases={[
            ...t.marqueePhrases,
            ...t.marqueePhrases,
            ...t.marqueePhrases,
          ]}
          translateX={-shift}
        />
      </SectionTransition>
    </section>
  );
}

function ImageRow({
  sources,
  translateX,
}: {
  sources: string[];
  translateX: number;
}) {
  return (
    <div className="overflow-x-clip">
      <div
        className="flex w-max gap-3"
        style={{
          transform: `translateX(${translateX}px)`,
          willChange: "transform",
        }}
      >
        {sources.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className="relative h-[190px] w-[300px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-2 sm:h-[250px] sm:w-[400px]"
          >
            <Image
              src={src}
              alt=""
              aria-hidden="true"
              fill
              loading="lazy"
              sizes="(min-width: 640px) 400px, 300px"
              className="object-cover object-top"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Fila de texto: dice en palabras lo que la fila de arriba ensena en
 * imagenes. Como banda es decorativa, asi que se oculta al lector de
 * pantalla; las mismas ideas estan en Servicios como contenido real.
 */
function PhraseRow({
  phrases,
  translateX,
}: {
  phrases: string[];
  translateX: number;
}) {
  return (
    <div aria-hidden="true" className="mt-3 overflow-x-clip">
      <div
        className="flex w-max items-center gap-6 sm:gap-10"
        style={{
          transform: `translateX(${translateX}px)`,
          willChange: "transform",
        }}
      >
        {phrases.map((phrase, index) => (
          <span
            key={`${phrase}-${index}`}
            className="flex shrink-0 items-center gap-6 whitespace-nowrap text-2xl font-medium tracking-tight text-ink-muted sm:gap-10 sm:text-4xl"
          >
            {phrase}
            <span className="size-1.5 shrink-0 rounded-full bg-accent-ink" />
          </span>
        ))}
      </div>
    </div>
  );
}
