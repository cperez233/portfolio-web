"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TechVisual } from "@/components/diagrams";
import { menuItems } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { BackgroundOrbs } from "./background-orbs";
import { FadeIn } from "./FadeIn";
import { FadeSwap } from "./FadeSwap";
import { SectionEdge } from "./section-transition";
import { cn } from "@/lib/utils";

/**
 * Seccion de Servicios: dos presentaciones del mismo contenido.
 *
 * - Escritorio (variante `desktop`: ancho lg y puntero fino): lista con
 *   panel de detalle y scroll-lock aparente, pensado para rueda y
 *   trackpad.
 * - Movil y tablet, incluido un iPad en horizontal: tarjetas en orden de
 *   lectura, con el scroll 100% nativo.
 *
 * El scroll-lock se atascaba en pantallas tactiles: el tramo fijado mide
 * cinco pantallas, y su panel con `overflow-y-auto` se quedaba el gesto
 * del dedo en cuanto desbordaba, asi que la pagina parecia congelada.
 * Ademas el detalle quedaba arriba y los titulos abajo, justo al reves
 * de como se lee en un movil.
 *
 * La eleccion es CSS y no JS: el HTML del servidor ya trae las dos, sin
 * salto de layout al hidratar, y la que no toca va en `display: none`.
 */
export default function InteractiveVideoScroller() {
  return (
    <section
      id="services"
      className="layer-top relative z-20 overflow-x-clip rounded-t-[32px] bg-surface transition-colors duration-500 sm:rounded-t-[48px]"
    >
      <SectionEdge />
      <BackgroundOrbs variant="middle" />

      <ServiceCards />
      <DesktopScroller />
    </section>
  );
}

/**
 * Movil y tablet: una tarjeta por servicio, con numero, titulo, tags y
 * descripcion seguidos. Sin sticky, sin contenedores con scroll propio y
 * sin medir el scroll: cada tarjeta solo entra con FadeIn, que anima
 * opacidad y transform una vez al aparecer.
 */
function ServiceCards() {
  const { t } = useLanguage();

  return (
    <div className="relative z-10 px-5 py-20 sm:px-8 sm:py-24 md:px-10 desktop:hidden">
      <div className="mx-auto w-full max-w-3xl">
        <FadeIn>
          <FadeSwap>
            <p className="mb-4 font-mono text-sm uppercase tracking-[0.28em] text-accent-ink">
              {t.services.eyebrow}
            </p>
            <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
              {t.services.title}
            </h2>
          </FadeSwap>
        </FadeIn>

        <ol className="mt-10 flex touch-manipulation flex-col gap-5 sm:gap-6">
          {menuItems.map((item, index) => {
            const copy = t.services.items[index];

            return (
              <li key={item.number}>
                <FadeIn y={24} delay={0.05}>
                  <article className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
                    <div className="relative h-20 sm:h-32">
                      <TechVisual
                        id={item.diagram}
                        density="compact"
                        className="h-full"
                      />
                      {/* Funde el diagrama con el texto de debajo. */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-950 to-transparent"
                      />
                    </div>

                    <div className="p-5 sm:p-6">
                      <FadeSwap>
                        <div className="flex items-baseline gap-3">
                          <span className="shrink-0 font-mono text-sm text-tech-accent">
                            {item.number}
                          </span>
                          <h3 className="text-balance text-xl font-medium tracking-tight text-white sm:text-2xl">
                            {copy.name}
                          </h3>
                        </div>
                        <p className="mt-2 font-mono text-[11px] uppercase leading-relaxed tracking-[0.18em] text-tech-accent sm:text-xs">
                          {copy.tag}
                        </p>
                        <p className="mt-3 text-base leading-relaxed text-white/80">
                          {copy.description}
                        </p>
                      </FadeSwap>
                    </div>
                  </article>
                </FadeIn>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/**
 * Escritorio: scroller con scroll-lock aparente.
 *
 * El contenedor mide una pantalla por servicio y el panel interior va
 * `sticky`: la seccion parece quedarse quieta mientras el progreso del
 * scroll cambia el servicio activo. El scroll nativo nunca se
 * intercepta, asi que el usuario siempre puede salir.
 *
 * Fuera de escritorio este bloque va en `display: none`: el
 * IntersectionObserver nunca lo ve entrar, asi que el bucle de medicion
 * no llega a arrancar y el coste en movil es cero.
 */
function DesktopScroller() {
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

  return (
    <div
      ref={containerRef}
      style={{ height: `${total * 100}svh` }}
      className="relative z-10 hidden desktop:block"
    >
      {/*
        `overflow-y-auto` como red de seguridad en ventanas bajas (un
        portatil de 700px de alto). Con raton no atrapa nada: Lenis
        gestiona la rueda sobre la ventana, no sobre este panel.
      */}
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-y-auto px-10 py-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-12 flex items-end justify-between gap-4">
            <FadeSwap>
              <p className="mb-4 font-mono text-sm uppercase tracking-[0.28em] text-accent-ink">
                {t.services.eyebrow}
              </p>
              <h2 className="text-6xl font-semibold uppercase tracking-tight text-ink">
                {t.services.title}
              </h2>
            </FadeSwap>

            <p className="font-mono text-sm uppercase tracking-wider text-ink-subtle">
              {String(activeIndex + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-14">
            {/* Panel de detalle: diagrama arriba, texto del servicio abajo. */}
            <div className="relative order-2 flex aspect-[5/4] flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
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

              <div className="relative shrink-0 p-8">
                <FadeSwap>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-tech-accent">
                    {activeCopy.tag}
                  </p>
                  <p className="mt-2 text-3xl font-medium tracking-tight text-white">
                    {activeCopy.name}
                  </p>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-white/80">
                    {activeCopy.description}
                  </p>
                </FadeSwap>
              </div>
            </div>

            {/* Lista de servicios */}
            <ul className="order-1 flex flex-col">
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
                        "flex w-full items-baseline gap-6 border-t border-line py-4 text-left transition-colors duration-300 ease-[var(--ease-premium)]",
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
                            "block text-balance text-2xl tracking-tight transition-colors duration-300",
                            isActive
                              ? "font-medium text-ink"
                              : "text-ink-subtle",
                          )}
                        >
                          {copy.name}
                        </span>
                        <span
                          className={cn(
                            "mt-1.5 block font-mono text-xs uppercase tracking-wider transition-colors duration-300",
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
}
