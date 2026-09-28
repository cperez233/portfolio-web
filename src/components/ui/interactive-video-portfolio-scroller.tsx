"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Plus, X } from "lucide-react";
import { TechVisual } from "@/components/diagrams";
import { menuItems, type ServiceItem } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { smoothScrollTo } from "@/lib/smooth-scroll";
import { useMediaQuery } from "@/lib/use-media-query";
import { FadeIn } from "./FadeIn";
import { FadeSwap } from "./FadeSwap";
import { SectionEdge } from "./section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Servicios como una pagina de manga: los cinco a la vista a la vez, y
 * cada quien abre el que necesita.
 *
 * - Escritorio: cuadricula de vinetas. El servicio abierto es la vineta
 *   grande (2x2) con su diagrama, lo que se recibe y su boton; los otros
 *   cuatro son vinetas pequenas al lado. Al elegir una pequena, la
 *   cuadricula se reacomoda (layout de Motion) y esa pasa a ser la grande.
 * - Celular: lista compacta (numero y nombre) en la que el abierto se
 *   despliega en su sitio. Antes habia que bajar cinco pantallas para
 *   saber que servicios hay.
 *
 * Se elige con clic o toque, nunca con hover: el boton "Cotizar esto"
 * siempre es el del servicio abierto. El scroll es 100% nativo.
 *
 * En celular la lista arranca cerrada y el abierto se puede cerrar: quien
 * llega ve los cinco nombres de un vistazo. En escritorio siempre hay uno
 * abierto (el primero al llegar), porque la vineta grande es la pagina.
 */
export default function InteractiveVideoScroller() {
  const { t } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const shown = isDesktop ? (open ?? 0) : open;
  const shouldReduceMotion = Boolean(useReducedMotion());

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

        <LayoutGroup>
          {/*
            4 columnas en escritorio: la vineta abierta va siempre arriba a
            la izquierda (2x2) y las cuatro cerradas llenan las otras 4
            celdas, a su derecha. Colocada a mano: dejada al flujo, si la
            abierta caia al final de una fila saltaba a la siguiente y
            dejaba un hueco de 2x2.
          */}
          <ul className="mt-10 grid grid-cols-1 gap-3 sm:mt-14 sm:gap-4 lg:auto-rows-[minmax(12.5rem,auto)] lg:grid-cols-4 lg:gap-5 lg:[grid-auto-flow:dense]">
            {menuItems.map((item, index) => (
              <ServicePanel
                key={item.number}
                item={item}
                index={index}
                total={menuItems.length}
                isOpen={index === shown}
                onSelect={() => setOpen(index)}
                onClose={() => setOpen(null)}
                reduceMotion={shouldReduceMotion}
              />
            ))}
          </ul>
        </LayoutGroup>
      </div>
    </section>
  );
}

interface ServicePanelProps {
  item: ServiceItem;
  index: number;
  total: number;
  isOpen: boolean;
  onSelect: () => void;
  /** Cierra el servicio (solo celular: en escritorio siempre hay uno abierto). */
  onClose: () => void;
  reduceMotion: boolean;
}

function ServicePanel({
  item,
  index,
  total,
  isOpen,
  onSelect,
  onClose,
  reduceMotion,
}: ServicePanelProps) {
  const { t } = useLanguage();
  const copy = t.services.items[index];
  const panelRef = useRef<HTMLLIElement>(null);
  const openedByUser = useRef(false);
  const panelId = `service-panel-${item.number}`;

  /*
    En celular el panel que se cierra arriba sube lo que hay debajo: si
    el recien abierto queda por encima del borde, se lleva a la vista.
    Solo tras un toque, no al cargar la pagina.
  */
  useEffect(() => {
    if (!isOpen || !openedByUser.current) return;
    openedByUser.current = false;
    const timer = window.setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const rect = panel.getBoundingClientRect();
      if (rect.top < 80 || rect.top > window.innerHeight * 0.6) {
        smoothScrollTo(rect.top + window.scrollY - 96);
      }
    }, reduceMotion ? 0 : 420);
    return () => window.clearTimeout(timer);
  }, [isOpen, reduceMotion]);

  return (
    <motion.li
      ref={panelRef}
      layout={!reduceMotion}
      transition={{ layout: { duration: 0.55, ease } }}
      className={cn(
        "service-panel relative overflow-hidden",
        isOpen ? "is-open lg:col-span-2 lg:col-start-1 lg:row-span-2 lg:row-start-1" : "lg:col-span-1",
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {isOpen ? (
          <motion.div
            key="open"
            id={panelId}
            className="flex h-full flex-col"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.35, delay: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
          >
            {/* Franja de tinta con el numero de la vineta. */}
            <header className="service-page-bar flex items-center justify-between gap-4 px-5 py-2.5 sm:px-6">
              <span className="font-display text-2xl leading-none tabular-nums text-accent">
                {item.number}
                <span className="ml-1 text-sm text-canvas/60">
                  / {String(total).padStart(2, "0")}
                </span>
              </span>
              <span className="hidden min-w-0 flex-1 truncate text-right font-mono text-xs text-canvas/70 sm:block">
                {copy.tag}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label={`${t.services.close}: ${copy.name}`}
                className="service-panel-close inline-flex size-9 shrink-0 items-center justify-center lg:hidden"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </header>

            <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
              {/*
                Vineta del diagrama, a todo el ancho: al lado del texto
                quedaba tan angosta que los nodos se apretaban. Con golpe
                de lineas de velocidad al abrirse.
              */}
              <div className="service-diagram relative h-32 shrink-0 overflow-hidden sm:h-40">
                {reduceMotion ? null : (
                  <motion.div
                    aria-hidden="true"
                    className="speed-lines pointer-events-none absolute left-1/2 top-1/2 z-10 size-[160%] -translate-x-1/2 -translate-y-1/2"
                    initial={{ opacity: 0.95, scale: 0.6 }}
                    animate={{ opacity: 0, scale: 1.3 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                  />
                )}
                <TechVisual
                  id={item.diagram}
                  density="compact"
                  showBarOnMobile
                  className="h-full"
                />
              </div>

              <div className="flex flex-1 flex-col">
                <FadeSwap>
                  <h3 className="text-balance text-2xl font-medium leading-tight tracking-tight text-ink sm:text-3xl">
                    {copy.name}
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5 sm:hidden">
                    {copy.tag.split(" / ").map((tag) => (
                      <li
                        key={tag}
                        className="border border-accent-ink/40 bg-accent-dim px-2 py-0.5 text-xs text-accent-ink"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-base leading-relaxed text-ink-muted">
                    {copy.description}
                  </p>
                </FadeSwap>
                <div className="mt-auto">
                  <ServiceActions index={index} />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="closed"
            type="button"
            onClick={() => {
              openedByUser.current = true;
              onSelect();
            }}
            aria-expanded={false}
            className="group flex h-full w-full items-center gap-4 p-4 text-left sm:p-5 lg:flex-col lg:items-start lg:gap-3"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.3, delay: 0.15 } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
          >
            <span className="flex shrink-0 items-center justify-between lg:w-full">
              <span className="font-display text-3xl leading-none text-accent-ink lg:text-5xl">
                {item.number}
              </span>
              <span
                aria-hidden="true"
                className="service-panel-plus hidden size-8 items-center justify-center lg:inline-flex"
              >
                <Plus className="size-4" />
              </span>
            </span>
            <span className="min-w-0 flex-1 lg:flex-none">
              <FadeSwap>
                <span className="block text-base font-medium leading-snug text-ink sm:text-lg">
                  {copy.name}
                </span>
                <span className="mt-1 hidden text-sm text-ink-subtle lg:block">
                  {copy.tag}
                </span>
              </FadeSwap>
            </span>
            <span
              aria-hidden="true"
              className="service-panel-plus inline-flex size-8 shrink-0 items-center justify-center lg:hidden"
            >
              <Plus className="size-4" />
            </span>
            <span className="mt-auto hidden font-display text-xs uppercase tracking-[0.14em] text-accent-ink lg:inline">
              {t.services.openHint} →
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.li>
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
