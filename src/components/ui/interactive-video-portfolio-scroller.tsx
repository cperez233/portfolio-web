"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUp, ArrowUpRight } from "lucide-react";
import { TechVisual } from "@/components/diagrams";
import { menuItems, type ServiceItem } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { FadeIn } from "./FadeIn";
import { FadeSwap } from "./FadeSwap";
import { SectionEdge } from "./section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { cn } from "@/lib/utils";

/*
  Separacion del apilado: la tarjeta N se fija STACK_TOP + N * STACK_STEP
  pixeles por debajo del borde de la pantalla. Asi asoma la franja de
  tinta (con su numero) de cada servicio anterior, como las paginas de
  un mazo.
*/
const STACK_TOP = 84;
const STACK_STEP = 14;

/**
 * Servicios como paginas de manga apiladas (patron "stacking cards").
 *
 * Cada servicio es una tarjeta completa: diagrama, que es, que se recibe
 * y su boton. Al bajar, la tarjeta se queda fija y la siguiente sube y la
 * tapa; la de abajo se encoge un poco, como un mazo de paginas.
 *
 * Sustituye al scroller de escritorio (lista + panel con vista previa al
 * pasar el raton). Ese panel cambiaba de servicio con el hover y volvia
 * al del scroll al sacar el raton de la lista: quien iba al boton
 * "Cotizar esto" terminaba pulsando el de otro servicio. Aqui no hay
 * estado de hover: el boton siempre es el de la tarjeta en la que esta.
 *
 * Mismo componente en escritorio y celular, con el scroll 100% nativo:
 * nada intercepta la rueda ni el dedo.
 */
export default function InteractiveVideoScroller() {
  const { t } = useLanguage();
  const listRef = useRef<HTMLOListElement>(null);
  const shouldReduceMotion = Boolean(useReducedMotion());
  const total = menuItems.length;

  // Avance por el mazo entero: de ahi sale cuanto se encoge cada tarjeta.
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="services"
      className="layer-top relative z-20 overflow-x-clip bg-surface px-5 pb-24 pt-20 transition-colors duration-500 sm:px-8 sm:pb-28 sm:pt-24 md:px-10"
    >
      <SectionEdge />

      <div className="mx-auto w-full max-w-6xl">
        <FadeIn>
          <FadeSwap>
            <p data-part={`${t.jojo.part} 4`} className="jojo-eyebrow mb-4 text-accent-ink">
              {t.services.eyebrow}
            </p>
            <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
              <RevealWords text={t.services.title} />
            </h2>
          </FadeSwap>
        </FadeIn>

        <ol ref={listRef} className="mt-10 flex flex-col sm:mt-14">
          {menuItems.map((item, index) => (
            <ServicePage
              key={item.number}
              item={item}
              index={index}
              total={total}
              progress={scrollYProgress}
              reduceMotion={shouldReduceMotion}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

interface ServicePageProps {
  item: ServiceItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}

function ServicePage({ item, index, total, progress, reduceMotion }: ServicePageProps) {
  const { t } = useLanguage();
  const copy = t.services.items[index];
  const articleRef = useRef<HTMLElement>(null);
  const isLast = index === total - 1;
  const top = STACK_TOP + index * STACK_STEP;

  /*
    Solo se fija si cabe entera bajo su linea de apilado. Una tarjeta
    fijada que no cabe deja su parte de abajo (el boton) fuera de la
    pantalla hasta que la siguiente la tapa: en un portatil de 600px de
    alto o un celular pequeno pasaria justo eso. Si no cabe, fluye normal.
  */
  const [fits, setFits] = useState(false);
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const check = () => setFits(article.offsetHeight + top + 16 <= window.innerHeight);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(article);
    window.addEventListener("resize", check);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", check);
    };
  }, [top]);

  // Cada tarjeta se encoge desde que le toca hasta el final del mazo; las
  // de mas abajo en la pila, un poco mas.
  const targetScale = 1 - (total - 1 - index) * 0.035;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);
  const stuck = fits && !isLast;

  const tags = copy.tag.split(" / ");
  const tilt = index % 2 === 0 ? -1.5 : 1.5;

  return (
    <li
      className={cn(
        "relative",
        fits && "sticky",
        // El margen es el recorrido de scroll de cada pagina fijada.
        !isLast && (fits ? "mb-[22svh]" : "mb-8"),
      )}
      style={fits ? { top } : undefined}
    >
      <motion.article
        ref={articleRef}
        aria-labelledby={`service-${item.number}`}
        style={stuck && !reduceMotion ? { scale, transformOrigin: "50% 0%" } : undefined}
        // Entra como una pagina que cae sobre el mazo: ladeada, se endereza.
        initial={reduceMotion ? false : { opacity: 0, y: 56, rotate: tilt }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="service-page relative overflow-hidden"
      >
        {/* Franja de tinta: lo que asoma de la pagina cuando otra la tapa. */}
        <header className="service-page-bar flex items-center justify-between gap-4 px-5 py-2.5 sm:px-7">
          <span className="font-display text-2xl leading-none tabular-nums text-accent">
            {item.number}
            <span className="ml-1 text-sm text-canvas/60">
              / {String(total).padStart(2, "0")}
            </span>
          </span>
          <span className="hidden min-w-0 truncate font-mono text-xs text-canvas/70 sm:block">
            {copy.tag}
          </span>
        </header>

        <div className="grid gap-5 p-5 sm:gap-7 sm:p-7 lg:grid-cols-12 lg:gap-10 lg:p-8">
          {/* Vineta del diagrama, con golpe de lineas de velocidad al llegar. */}
          <div className="service-diagram relative h-32 overflow-hidden sm:h-44 lg:order-2 lg:col-span-6 lg:h-auto lg:min-h-60">
            {reduceMotion ? null : (
              <motion.div
                aria-hidden="true"
                className="speed-lines pointer-events-none absolute left-1/2 top-1/2 z-10 size-[160%] -translate-x-1/2 -translate-y-1/2"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: [0, 0.95, 0], scale: [0.6, 1, 1.3] }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
              />
            )}
            <TechVisual
              id={item.diagram}
              density="compact"
              showBarOnMobile
              className="h-full"
            />
          </div>

          <div className="relative flex flex-col lg:order-1 lg:col-span-6">
            <span aria-hidden="true" className="service-ghost-number absolute -top-2 right-0 hidden sm:block">
              {item.number}
            </span>
            <FadeSwap>
              <h3
                id={`service-${item.number}`}
                className="relative pr-16 text-balance text-2xl font-medium leading-tight tracking-tight text-ink sm:pr-28 sm:text-3xl"
              >
                {copy.name}
              </h3>
              <ul className="relative mt-3 flex flex-wrap gap-1.5 sm:hidden">
                {tags.map((tag) => (
                  <li
                    key={tag}
                    className="border border-accent-ink/40 bg-accent-dim px-2 py-0.5 text-xs text-accent-ink"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
              <p className="relative mt-3 max-w-lg text-base leading-relaxed text-ink-muted sm:mt-4 sm:pr-24 sm:text-lg lg:pr-28">
                {copy.description}
              </p>
            </FadeSwap>
            <div className="relative mt-auto">
              <ServiceActions index={index} />
            </div>
          </div>
        </div>
      </motion.article>
    </li>
  );
}

/**
 * Cierre de cada servicio: lo que se lleva el cliente y el boton para
 * cotizarlo por WhatsApp, con el mensaje ya escrito. El servicio de
 * revision enlaza ademas a la revision gratis (#audit).
 */
function ServiceActions({ index }: { index: number }) {
  const { t, language } = useLanguage();
  const copy = t.services.items[index];
  if (!copy) return null;

  return (
    <div className="mt-5">
      <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
        <span className="mr-2 font-display uppercase tracking-[0.14em] text-accent-ink">
          {t.services.deliverableLabel}
        </span>
        {copy.deliverable}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href={buildWhatsappUrl(t.services.whatsappMessage.replace("{service}", copy.name))}
          onClick={() => trackWhatsappClick(`service-${index + 1}`, language)}
          target="_blank"
          rel="noopener noreferrer"
          className="accent-fill group inline-flex min-h-11 items-center gap-2 px-5 text-sm"
        >
          {t.services.cta}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
        {copy.auditLink ? (
          <a
            href="#audit"
            className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-ink underline decoration-accent-ink/60 underline-offset-4 transition-colors hover:text-accent-ink"
          >
            {t.services.auditLink}
            <ArrowUp
              aria-hidden="true"
              className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </a>
        ) : null}
      </div>
    </div>
  );
}
