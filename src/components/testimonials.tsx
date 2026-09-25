"use client";

import { useRef, type RefObject } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { testimonials, type Testimonial } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { useMediaQuery } from "@/lib/use-media-query";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";

/** Cuando las resenas van en rejilla (lg), no en carrusel. */
const GRID_QUERY = "(min-width: 64rem)";

const ease = [0.22, 1, 0.36, 1] as const;

/** "Hotel Logístico" -> "HL". */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/*
  Escritorio: las tarjetas salen de un monton en el centro y se reparten
  en abanico, cada una con su giro. La del centro queda mas alta: es la
  capa de arriba. Al pasar el raton se endereza y sube.
*/
const fanParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
function fanCard(offset: number): Variants {
  return {
    hidden: {
      opacity: 0,
      x: `${-offset * 100}%`,
      y: 40,
      rotate: offset * -8,
      scale: 0.9,
    },
    show: {
      opacity: 1,
      x: 0,
      y: offset === 0 ? -14 : 0,
      rotate: offset * 2,
      scale: 1,
      transition: { duration: 0.9, ease },
    },
  };
}

/**
 * Resenas de clientes, bajo la tira de paginas publicadas. Solo salen
 * las aprobadas (`approved` en site.ts): sin ninguna, el bloque no existe.
 *
 * - Celular y tablet: carrusel que se desliza, con la tarjeta enfocada al
 *   frente y las vecinas mas pequenas, giradas y apagadas: una pila.
 * - Desde lg: rejilla en abanico.
 */
export function Testimonials() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const isGrid = useMediaQuery(GRID_QUERY);
  const listRef = useRef<HTMLUListElement>(null);
  const approved = testimonials.filter((item) => item.approved && t.testimonials.quotes[item.key]);
  if (approved.length === 0) return null;

  const center = (approved.length - 1) / 2;
  const animateFan = isGrid && !shouldReduceMotion;

  return (
    <FadeIn className="mt-14 sm:mt-20">
      <FadeSwap>
        <h3 className="text-xl font-medium tracking-tight text-ink sm:text-2xl">
          {t.testimonials.title}
        </h3>
      </FadeSwap>
      <motion.ul
        ref={listRef}
        data-lenis-prevent
        key={animateFan ? "fan" : "row"}
        initial={animateFan ? "hidden" : false}
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        variants={fanParent}
        className="-mx-5 mt-2 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 py-6 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8 md:-mx-10 md:scroll-px-10 md:px-10 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-6 lg:overflow-visible lg:px-0 lg:pt-10 [&::-webkit-scrollbar]:hidden"
      >
        {approved.map((item, index) => (
          <motion.li
            key={item.key}
            variants={animateFan ? fanCard(index - center) : undefined}
            style={{ zIndex: index === Math.round(center) ? 2 : 1 }}
            className="relative w-[82%] shrink-0 snap-start sm:w-[60%] lg:w-auto"
          >
            {isGrid || shouldReduceMotion ? (
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { rotate: 0, y: -8, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="h-full"
              >
                <ReviewCard item={item} />
              </motion.div>
            ) : (
              <StackedCard listRef={listRef}>
                <ReviewCard item={item} />
              </StackedCard>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </FadeIn>
  );
}

/**
 * Celular: la tarjeta crece al llegar a su sitio en el carrusel y se
 * encoge, gira y se apaga al irse hacia un lado. Medido sobre el scroll
 * horizontal de la lista, no el de la pagina.
 */
function StackedCard({
  listRef,
  children,
}: {
  listRef: RefObject<HTMLUListElement | null>;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({
    container: listRef,
    target: ref,
    axis: "x",
    offset: ["start end", "end start"],
  });
  // Con snap-start la tarjeta activa queda hacia 0.5 del recorrido.
  const scale = useTransform(scrollXProgress, [0.1, 0.52, 0.9], [0.86, 1, 0.86]);
  const rotate = useTransform(scrollXProgress, [0.1, 0.52, 0.9], [5, 0, -5]);
  const opacity = useTransform(scrollXProgress, [0.1, 0.52, 0.9], [0.45, 1, 0.45]);

  return (
    <motion.div ref={ref} style={{ scale, rotate, opacity }} className="h-full origin-bottom">
      {children}
    </motion.div>
  );
}

function ReviewCard({ item }: { item: Testimonial }) {
  const { t } = useLanguage();

  return (
    <figure className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-[var(--tech-card-shadow)] transition-colors duration-500 sm:p-7">
      {/* Comilla grande de fondo, decorativa. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 right-4 select-none font-serif text-[9rem] leading-none text-accent-ink opacity-15"
      >
        &rdquo;
      </span>
      <FadeSwap className="relative flex-1">
        <blockquote className="text-lg leading-snug tracking-tight text-ink sm:text-xl">
          <p>&ldquo;{t.testimonials.quotes[item.key]}&rdquo;</p>
        </blockquote>
      </FadeSwap>
      <figcaption className="relative mt-8 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="accent-fill inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
        >
          {initials(item.author)}
        </span>
        <span className="min-w-0 leading-tight">
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-medium text-ink transition-colors hover:text-accent-ink"
          >
            {item.author}
            <ArrowUpRight aria-hidden="true" className="ml-1 inline size-3.5 align-baseline opacity-60" />
          </a>
          <span className="block text-sm text-ink-subtle">{item.business}</span>
        </span>
      </figcaption>
    </figure>
  );
}
