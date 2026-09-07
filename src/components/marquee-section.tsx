"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useReducedMotion } from "framer-motion";
import { marqueeRowOne, marqueeRowTwo } from "@/data/site";
import { BackgroundOrbs } from "./ui/background-orbs";

/**
 * Dos filas que se desplazan en sentidos opuestos segun la posicion del
 * scroll. Listener pasivo y solo se toca transform.
 *
 * Cada fila se recorta con overflow-x-clip: sin eso, las filas
 * trasladadas medirian mas de 15.000px y arrastrarian scroll
 * horizontal a toda la pagina.
 */
export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(200);
  const shouldReduceMotion = useReducedMotion();

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
      aria-label="Motion showcase"
      className="layer-top relative z-10 overflow-x-clip rounded-t-[32px] bg-canvas pb-10 pt-20 transition-colors duration-500 sm:rounded-t-[48px] sm:pt-28 md:pt-32"
    >
      <BackgroundOrbs variant="top" />

      <div className="relative z-10">
      <MarqueeRow
        sources={[...marqueeRowOne, ...marqueeRowOne, ...marqueeRowOne]}
        translateX={shift}
      />
      <div className="h-3" />
      <MarqueeRow
        sources={[...marqueeRowTwo, ...marqueeRowTwo, ...marqueeRowTwo]}
        translateX={-shift}
      />
      </div>
    </section>
  );
}

interface MarqueeRowProps {
  sources: string[];
  translateX: number;
}

function MarqueeRow({ sources, translateX }: MarqueeRowProps) {
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
            className="relative h-[210px] w-[330px] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface-2 sm:h-[270px] sm:w-[420px]"
          >
            <Image
              src={src}
              alt=""
              aria-hidden="true"
              fill
              // GIF animado: optimizarlo lo congela en el primer frame.
              unoptimized
              loading="lazy"
              sizes="(min-width: 640px) 420px, 330px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
