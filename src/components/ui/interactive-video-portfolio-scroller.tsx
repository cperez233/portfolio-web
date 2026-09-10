"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TechVisual } from "@/components/diagrams";
import { menuItems } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { BackgroundOrbs } from "./background-orbs";
import { SectionEdge } from "./section-transition";
import { FadeSwap } from "./FadeSwap";
import { cn } from "@/lib/utils";

/**
 * Scroller de servicios con scroll-lock aparente.
 *
 * El contenedor mide una pantalla por servicio y el panel interior va
 * `sticky`: la seccion parece quedarse quieta mientras el progreso del
 * scroll cambia el servicio activo. El scroll nativo nunca se
 * intercepta, asi que el usuario siempre puede salir.
 */
export default function InteractiveVideoScroller() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const total = menuItems.length;

  /*
    El indice se mide por frame mientras la seccion esta a la vista, en
    vez de escuchar el evento `scroll`.

    Con Lenis de por medio, un desplazamiento programatico (un ancla del
    menu, un scrollTo) mueve la pagina sin que llegue un `scroll` fiable,
    y el indice se quedaba congelado en el ultimo valor. Medir contra el
    rect no depende de como se haya producido el movimiento.

    El bucle solo corre mientras la seccion intersecta el viewport, y
    setActiveIndex con el mismo valor no provoca render en React, asi
    que el coste fuera de esta seccion es cero.
  */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    let running = false;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const scrollable = element.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.999);
      setActiveIndex(Math.floor(progress * total));
    };

    const loop = () => {
      measure();
      frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          loop();
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
          measure();
        }
      },
      { threshold: 0 },
    );

    observer.observe(element);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [total]);

  /** Salta al tramo de scroll de un servicio concreto. */
  const goToIndex = useCallback(
    (index: number) => {
      const element = containerRef.current;
      if (!element) return;

      const scrollable = element.offsetHeight - window.innerHeight;
      /*
        Posicion en el documento via rect + scrollY, no `offsetTop`: el
        offsetParent de este contenedor es la <section> `relative`, asi
        que offsetTop valia casi 0 y el salto caia al principio de la
        pagina en lugar de al tramo del servicio.
      */
      const documentTop = element.getBoundingClientRect().top + window.scrollY;
      const top = documentTop + (scrollable * (index + 0.5)) / total;
      // Via Lenis: un window.scrollTo se deshace en el frame siguiente.
      smoothScrollTo(top);
    },
    [total],
  );

  const active = menuItems[activeIndex] ?? menuItems[0];
  const activeCopy = t.services.items[activeIndex] ?? t.services.items[0];

  /*
    El scroll-lock mide una pantalla por servicio. El panel interior es
    `overflow-y-auto` como red de seguridad: en un movil apaisado de
    844x390 o un portatil bajo de 820x700 el contenido puede superar la
    altura disponible, y sin esto se recortaba en vez de dejarse leer.
  */
  const scroller = (
    <div
      ref={containerRef}
      style={{ height: `${total * 100}svh` }}
      className="relative z-10"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-y-auto px-5 py-10 sm:px-8 sm:py-12 md:px-10 lg:py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8 lg:mb-12">
            <FadeSwap>
              <p className="mb-4 font-mono text-sm uppercase tracking-[0.28em] text-accent-ink">
                {t.services.eyebrow}
              </p>
              <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
                {t.services.title}
              </h2>
            </FadeSwap>

            <p className="hidden font-mono text-sm uppercase tracking-wider text-ink-subtle sm:block">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-14">
            {/*
              Panel de medios: diagrama arriba, texto del servicio abajo.
              En columna y no superpuestos: el texto (tag, nombre y
              descripcion) mide casi todo el panel en un movil, y encima de
              un diagrama tapaba justo las fichas que tenia que acompanar.
              Siempre oscuro, como el propio diagrama.
            */}
            <div className="services-media relative order-1 flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:aspect-[4/3] lg:order-2 lg:aspect-[5/4]">
              <div className="relative min-h-16 flex-1">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={active.number}
                    className="absolute inset-0"
                    initial={
                      shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <TechVisual
                      id={active.diagram}
                      density="compact"
                      className="h-full"
                    />
                  </motion.div>
                </AnimatePresence>


                {/* Funde el diagrama con el bloque de texto de debajo. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-zinc-950 to-transparent"
                />
              </div>

              <div className="relative shrink-0 p-4 sm:p-6 lg:p-8">
                <FadeSwap>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-tech-accent">
                    {activeCopy.tag}
                  </p>
                  <p className="mt-2 text-xl font-medium tracking-tight text-white sm:text-3xl">
                    {activeCopy.name}
                  </p>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">
                    {activeCopy.description}
                  </p>
                </FadeSwap>
              </div>

            </div>

            {/* Lista de servicios */}
            <ul className="order-2 flex flex-col lg:order-1">
              {menuItems.map((item, index) => {
                const isActive = index === activeIndex;
                const copy = t.services.items[index];

                return (
                  <li key={item.number}>
                    <button
                      type="button"
                      onClick={() => goToIndex(index)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full items-baseline gap-4 border-t border-line py-3 text-left transition-colors duration-300 ease-[var(--ease-premium)] sm:gap-6 sm:py-4",
                        index === menuItems.length - 1 &&
                          "border-b border-line",
                      )}
                    >
                      <span
                        className={cn(
                          "shrink-0 font-mono text-sm transition-colors duration-300",
                          isActive ? "text-accent-ink" : "text-ink-subtle",
                        )}
                      >
                        {item.number}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block text-balance text-lg tracking-tight transition-colors duration-300 sm:text-2xl",
                            isActive
                              ? "font-medium text-ink"
                              : "text-ink-subtle",
                          )}
                        >
                          {copy.name}
                        </span>
                        {/*
                          Oculto en movil: son cinco lineas que no
                          caben en una pantalla, y el tag del servicio
                          activo ya se lee en el panel de medios.
                        */}
                        <span
                          className={cn(
                            "mt-1.5 hidden font-mono text-xs uppercase tracking-wider transition-colors duration-300 sm:block",
                            isActive
                              ? "text-accent-ink"
                              : "text-ink-subtle/60",
                          )}
                        >
                          {copy.tag}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="services"
      className="layer-top relative z-20 overflow-x-clip rounded-t-[32px] bg-surface transition-colors duration-500 sm:rounded-t-[48px]"
    >
      <SectionEdge />
      <BackgroundOrbs variant="middle" />

      {scroller}
    </section>
  );
}
