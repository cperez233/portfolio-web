"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { TechVisual } from "@/components/diagrams";
import { menuItems, type ServiceItem } from "@/data/site";
import { DESKTOP_QUERY } from "@/lib/breakpoints";
import { useLanguage } from "@/lib/language";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { useMediaQuery } from "@/lib/use-media-query";
import { BackgroundOrbs } from "./background-orbs";
import { FadeIn } from "./FadeIn";
import { FadeSwap } from "./FadeSwap";
import { SectionEdge } from "./section-transition";
import { cn } from "@/lib/utils";

/**
 * Seccion de Servicios: dos presentaciones del mismo contenido.
 *
 * - Escritorio (variante `desktop`: ancho lg y puntero no tactil): lista
 *   con panel de detalle y scroll-lock aparente, pensado para rueda y
 *   trackpad.
 * - Movil y tablet, incluido un iPad en horizontal: tarjetas en orden de
 *   lectura que ruedan en 3D al pasar, con el scroll 100% nativo.
 *
 * El scroll-lock se atascaba en pantallas tactiles: el tramo fijado mide
 * cinco pantallas, y su panel con `overflow-y-auto` se quedaba el gesto
 * del dedo en cuanto desbordaba, asi que la pagina parecia congelada.
 *
 * El HTML del servidor trae las dos presentaciones y el CSS muestra la
 * que toca, sin salto de layout al hidratar. Despues, en escritorio, las
 * tarjetas se desmontan (useMediaQuery), para que su useScroll no mida
 * nada mientras estan ocultas.
 */
export default function InteractiveVideoScroller() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <section
      id="services"
      className="layer-top relative z-20 overflow-x-clip rounded-t-[32px] bg-surface transition-colors duration-500 sm:rounded-t-[48px]"
    >
      <SectionEdge />
      <BackgroundOrbs variant="middle" />

      {isDesktop ? null : <ServiceCards />}
      <DesktopScroller />
    </section>
  );
}

/**
 * Movil y tablet: una tarjeta por servicio, con efecto rolodex.
 *
 * Distinto a propósito del mazo de Proyectos, que fija las tarjetas y
 * las apila. Aqui nada se fija: cada tarjeta fluye con el scroll y rueda
 * sobre su eje horizontal al pasar. Entra desde abajo inclinada hacia
 * atras y en sombra, se endereza y se ilumina al llegar al centro, y se
 * inclina hacia delante al salir por arriba. Sin sticky ni contenedores
 * con scroll propio: el gesto siempre mueve la pagina.
 */
function ServiceCards() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const total = menuItems.length;

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
          {menuItems.map((item, index) => (
            <ServiceCard
              key={item.number}
              item={item}
              index={index}
              total={total}
              reduceMotion={Boolean(shouldReduceMotion)}
            />
          ))}
        </ol>
      </div>
    </div>
  );
}

interface ServiceCardProps {
  item: ServiceItem;
  index: number;
  total: number;
  reduceMotion: boolean;
}

function ServiceCard({ item, index, total, reduceMotion }: ServiceCardProps) {
  const { t } = useLanguage();
  const copy = t.services.items[index];
  const itemRef = useRef<HTMLLIElement>(null);

  /*
    Progreso propio de cada tarjeta: 0 cuando su borde superior asoma por
    abajo, 0.5 con la tarjeta centrada, 1 cuando su borde inferior sale
    por arriba. Se mide el <li>, que no lleva transform, y se anima el
    <article> de dentro. Aqui medir cada tarjeta si es fiable: ninguna va
    fijada al viewport.
  */
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [16, 0, 0, -12],
  );
  const y = useTransform(scrollYProgress, [0, 0.35], [48, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0.92, 1, 1, 0.95],
  );
  // Sombra fuera del centro y luz en el centro: el foco.
  const shade = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.5, 0, 0, 0.55],
  );
  const glow = useTransform(
    scrollYProgress,
    [0.2, 0.42, 0.58, 0.8],
    [0.15, 1, 1, 0.15],
  );

  const tags = copy.tag.split(" / ");

  return (
    <li ref={itemRef}>
      <motion.article
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                y,
                scale,
                transformPerspective: 1100,
                willChange: "transform",
              }
        }
        className="relative overflow-hidden rounded-3xl border border-tech-line bg-tech-bg shadow-[var(--tech-card-shadow)] transition-[background-color,border-color,color,box-shadow] duration-500"
      >
        {/* Filo de acento: se enciende con la tarjeta en el centro. */}
        <motion.span
          aria-hidden="true"
          style={reduceMotion ? undefined : { opacity: glow }}
          className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-tech-accent to-transparent"
        />
        {/* Borde de luz del foco, por encima del borde zinc. */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: reduceMotion ? 0 : glow }}
          className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-inset ring-tech-accent/25"
        />

        <div className="relative h-28 sm:h-36">
          <TechVisual
            id={item.diagram}
            density="compact"
            showBarOnMobile
            className="h-full"
          />
          {/* Funde el diagrama con el texto de debajo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-tech-bg to-transparent"
          />
        </div>

        <div className="relative px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
          <FadeSwap>
            <p className="font-mono text-xs tracking-[0.2em] text-tech-ink-subtle">
              <span className="text-tech-accent">{item.number}</span>
              {" / "}
              {String(total).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-balance text-[1.375rem] font-medium leading-snug tracking-tight text-tech-ink sm:text-2xl">
              {copy.name}
            </h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-tech-accent/20 bg-tech-accent/[0.07] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-tech-accent sm:text-[11px]"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-tech-ink-soft sm:text-base">
              {copy.description}
            </p>
          </FadeSwap>
        </div>

        {/*
          Sombra de entrada y salida; en el centro desaparece. Del color del
          lienzo y no negra: en el tema claro el negro dejaba la tarjeta
          sucia, y en el oscuro el lienzo ya es casi negro.
        */}
        {reduceMotion ? null : (
          <motion.div
            aria-hidden="true"
            style={{ opacity: shade }}
            className="pointer-events-none absolute inset-0 z-20 bg-canvas"
          />
        )}
      </motion.article>
    </li>
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
            <div className="relative order-2 flex aspect-[5/4] flex-col overflow-hidden rounded-2xl border border-tech-line bg-tech-bg transition-[background-color,border-color,color,box-shadow] duration-500">
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
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-tech-bg to-transparent"
                />
              </div>

              <div className="relative shrink-0 p-8">
                <FadeSwap>
                  <p className="font-mono text-xs uppercase tracking-[0.2em] text-tech-accent">
                    {activeCopy.tag}
                  </p>
                  <p className="mt-2 text-3xl font-medium tracking-tight text-tech-ink">
                    {activeCopy.name}
                  </p>
                  <p className="mt-3 max-w-md text-base leading-relaxed text-tech-ink-soft">
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
