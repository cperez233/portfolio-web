"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowUp, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cases, miniProjects, moreWork, type CaseShot, type CaseStudy } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { GithubMark } from "@/components/ui/github-mark";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { CountUp } from "@/components/ui/count-up";
import { SectionEdge } from "@/components/ui/section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Proyectos como casos para quien contrata: que necesitaba el negocio,
 * que se construyo y que cambio, con capturas reales.
 *
 * Antes eran tres tarjetas tecnicas apiladas (stack, diagramas, enlace a
 * GitHub) que en celular median seis pantallas y le hablaban a otro
 * programador. Ahora cada caso abre con sus capturas, y en celular el
 * resultado sube por encima del borde de la galeria: la capa que se lee
 * primero es lo que cambio para el cliente.
 *
 * El proyecto que solo le dice algo a un perfil tecnico (PairSync) queda
 * como enlace al pie.
 */
export function ProjectsSection() {
  const { t } = useLanguage();

  return (
    <section
      id="projects"
      className="layer-top relative z-30 -mt-8 overflow-x-clip rounded-t-[32px] bg-canvas px-5 pb-24 pt-24 transition-colors duration-500 sm:rounded-t-[48px] sm:px-8 md:px-10"
    >
      <SectionEdge />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <FadeIn className="mb-14 sm:mb-20">
          <FadeSwap>
            <p className="mb-4 text-sm font-medium text-accent-ink">
              {t.projects.eyebrow}
            </p>
            <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
              <RevealWords text={t.projects.title} />
            </h2>
            <p className="mt-4 max-w-xl text-lead text-ink-muted">
              {t.projects.intro}
            </p>
          </FadeSwap>
        </FadeIn>

        <div className="flex flex-col gap-24 sm:gap-32">
          {cases.map((item, index) => (
            <CaseBlock key={item.key} item={item} index={index} />
          ))}
        </div>

        <MoreWork />
      </div>
    </section>
  );
}

function CaseBlock({ item, index }: { item: CaseStudy; index: number }) {
  const { t, language } = useLanguage();
  const copy = t.projects.items[index];
  const shouldReduceMotion = useReducedMotion();
  const blockRef = useRef<HTMLElement>(null);
  // Casos alternos: galeria a la izquierda, luego a la derecha.
  const flip = index % 2 === 1;

  /*
    Parallax suave entre capas: la galeria se desplaza un poco mas lenta
    que el texto. 24px, poco a proposito: en celular un parallax largo
    marea.
  */
  const { scrollYProgress } = useScroll({
    target: blockRef,
    offset: ["start end", "end start"],
  });
  const galleryY = useTransform(scrollYProgress, [0, 1], [24, -24]);

  const labels = t.projects.labels;

  return (
    <article
      ref={blockRef}
      aria-labelledby={`case-${item.key}`}
      className="grid lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-x-14"
    >
      {/* Cabecera: en celular va antes que la galeria. */}
      <FadeIn
        className={cn(
          "lg:col-span-5 lg:row-start-1 lg:self-end",
          flip ? "lg:col-start-1" : "lg:col-start-8",
        )}
      >
        <FadeSwap>
          <p className="text-sm text-ink-subtle">
            <span className="font-medium text-accent-ink">{copy.client}</span>
            {" · "}
            {copy.category}
          </p>
          <h3
            id={`case-${item.key}`}
            className="mt-3 text-balance text-3xl font-medium leading-[1.1] tracking-tight text-ink sm:text-4xl"
          >
            {copy.title}
          </h3>
        </FadeSwap>
      </FadeIn>

      <motion.div
        style={shouldReduceMotion ? undefined : { y: galleryY }}
        className={cn(
          "mt-8 lg:col-span-7 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:self-center",
          flip ? "lg:col-start-6" : "lg:col-start-1",
        )}
      >
        <Gallery item={item} alts={copy.shotAlts} />
      </motion.div>

      <div
        className={cn(
          "lg:col-span-5 lg:row-start-2",
          flip ? "lg:col-start-1" : "lg:col-start-8",
        )}
      >
        {/*
          Resultado: en celular sube por encima del borde inferior de la
          galeria (margen negativo) y es la capa mas alta del caso.
        */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease, delay: 0.15 }}
          className="relative z-10 mx-3 -mt-12 rounded-3xl border border-line-strong bg-surface p-5 shadow-[var(--tech-card-shadow)] transition-colors duration-500 sm:mx-6 sm:p-6 lg:mx-0 lg:mt-8"
        >
          {item.stat ? (
            <p className="text-6xl font-semibold tracking-tighter text-name transition-colors duration-500 sm:text-7xl">
              <CountUp value={item.stat} />
            </p>
          ) : (
            <p className="text-sm font-medium text-accent-ink">{labels.result}</p>
          )}
          <FadeSwap>
            {copy.statLabel ? (
              <p className="mt-1 text-base text-ink-muted">{copy.statLabel}</p>
            ) : null}
            <p
              className={cn(
                "text-pretty tracking-tight text-ink",
                item.stat
                  ? "mt-4 border-t border-line pt-4 text-base leading-relaxed text-ink-muted"
                  : "mt-2 text-xl font-medium leading-snug sm:text-2xl",
              )}
            >
              {copy.result}
            </p>
          </FadeSwap>
        </motion.div>

        <FadeIn delay={0.1}>
          <FadeSwap>
            <dl className="mt-8 flex flex-col gap-5">
              {(
                [
                  [labels.problem, copy.problem],
                  [labels.solution, copy.solution],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="grid gap-1.5 sm:grid-cols-[8rem_1fr] sm:gap-6 lg:grid-cols-1 lg:gap-1.5">
                  <dt className="text-sm font-medium text-ink">{label}</dt>
                  <dd className="text-base leading-relaxed text-ink-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </FadeSwap>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href={buildWhatsappUrl(t.whatsappMessage)}
              onClick={() => trackWhatsappClick(`case-${item.key}`, language)}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium text-ink transition-[transform,border-color,color] duration-200 ease-[var(--ease-premium)] hover:border-accent hover:text-accent-ink active:scale-[0.97]"
            >
              <FadeSwap>
                <span>{t.projects.askCta}</span>
              </FadeSwap>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            {item.liveUrl ? (
              <TextLink href={item.liveUrl} external>
                {t.projects.liveCta}
              </TextLink>
            ) : null}
            {item.repoUrl ? (
              <TextLink href={item.repoUrl} external icon={<GithubMark className="size-4" />}>
                {t.projects.repoCta}
              </TextLink>
            ) : null}
          </div>
        </FadeIn>
      </div>
    </article>
  );
}

/**
 * Galeria que se desliza con el dedo: capturas en una fila con snap, la
 * siguiente asomando por el borde para que se entienda que hay mas. Si
 * el caso tiene capturas de celular, en pantallas pequenas se ven esas,
 * en vertical y con forma de telefono.
 *
 * En escritorio la fila ocupa el ancho de la columna, una captura cada
 * vez, con flechas: con raton no hay gesto de deslizar.
 */
function Gallery({ item, alts }: { item: CaseStudy; alts: string[] }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? false
          : { clipPath: "inset(6% 8% 6% 8% round 32px)", opacity: 0 }
      }
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0px)", opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, ease }}
      // Sangra hasta el borde de la pantalla en celular: la fila corre de
      // lado a lado, como en una app.
      className="-mx-5 sm:-mx-8 md:-mx-10 lg:mx-0"
    >
      {item.mobileShots ? (
        <>
          <ShotRow shots={item.mobileShots} alts={alts} phone className="lg:hidden" />
          <ShotRow shots={item.shots} alts={alts} className="hidden lg:block" />
        </>
      ) : (
        <ShotRow shots={item.shots} alts={alts} />
      )}
    </motion.div>
  );
}

function ShotRow({
  shots,
  alts,
  phone = false,
  className,
}: {
  shots: CaseShot[];
  alts: string[];
  phone?: boolean;
  className?: string;
}) {
  const rowRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  // Captura activa segun el desplazamiento de la fila.
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    /*
      Por avance de la fila y no por posicion de cada captura: con dos
      capturas verticales la fila apenas desborda, el scroll nunca llega
      a alinear la segunda y el contador se quedaba en 1.
    */
    const onScroll = () => {
      const max = row.scrollWidth - row.clientWidth;
      if (max <= 0) return;
      setActive(Math.round((row.scrollLeft / max) * (row.children.length - 1)));
    };
    row.addEventListener("scroll", onScroll, { passive: true });
    return () => row.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = useCallback(
    (index: number) => {
      const row = rowRef.current;
      if (!row) return;
      const max = row.scrollWidth - row.clientWidth;
      row.scrollTo({
        left: (max * index) / Math.max(row.children.length - 1, 1),
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    },
    [shouldReduceMotion],
  );

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={rowRef}
        // Lenis no debe tragarse el gesto horizontal de la fila.
        data-lenis-prevent
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:scroll-px-8 sm:px-8 md:scroll-px-10 md:px-10 lg:scroll-px-0 lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((shot, index) => (
          <li
            key={shot.src}
            className={cn(
              "shrink-0 snap-start",
              phone ? "w-[58%] sm:w-[40%]" : "w-[86%] sm:w-[70%] lg:w-full",
            )}
          >
            {/*
              Entrada en cascada desde la derecha: las capturas llegan una
              tras otra y la ultima queda asomando, que es la pista de que
              la fila se desliza.
            */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 56 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease, delay: 0.25 + index * 0.1 }}
            >
            <div
              className={cn(
                "group relative overflow-hidden border border-line-strong bg-surface-2 shadow-[var(--tech-card-shadow)] transition-[transform,opacity,background-color,border-color] duration-500 ease-[var(--ease-premium)]",
                phone
                  ? "aspect-[390/844] rounded-[28px] p-1.5"
                  : "aspect-[16/11] rounded-[22px] lg:aspect-[16/10] lg:rounded-[28px]",
                // La captura activa al frente; las demas se apartan un poco
                // al deslizar. En escritorio solo se ve una, no hace falta.
                index !== active && "scale-[0.94] opacity-55 lg:scale-100 lg:opacity-100",
              )}
            >
              <div
                className={cn(
                  "relative h-full w-full overflow-hidden",
                  phone ? "rounded-[22px]" : "",
                )}
              >
                <Image
                  src={shot.src}
                  alt={alts[index] ?? ""}
                  fill
                  loading="lazy"
                  sizes={phone ? "(min-width: 640px) 40vw, 58vw" : "(min-width: 1024px) 55vw, 86vw"}
                  className="object-cover object-left-top transition-transform duration-700 ease-[var(--ease-premium)] group-hover:scale-[1.03]"
                />
              </div>
            </div>
            </motion.div>
          </li>
        ))}
      </ul>

      {/* Capa flotante: contador y, con raton, flechas. */}
      <div className="pointer-events-none absolute left-8 top-3 sm:left-11 md:left-13 lg:left-4 lg:top-4">
        <span className="rounded-full bg-black/60 px-2.5 py-1 font-mono text-[11px] tabular-nums text-white backdrop-blur-sm">
          {active + 1} / {shots.length}
        </span>
      </div>

      <div className="absolute bottom-4 right-4 hidden gap-2 lg:flex">
        <ArrowButton
          label="Anterior"
          disabled={active === 0}
          onClick={() => goTo(active - 1)}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </ArrowButton>
        <ArrowButton
          label="Siguiente"
          disabled={active === shots.length - 1}
          onClick={() => goTo(active + 1)}
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </ArrowButton>
      </div>

    </div>
  );
}

function ArrowButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-[opacity,transform,background-color] duration-200 hover:bg-black/80 active:scale-95 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function TextLink({
  href,
  external = false,
  icon,
  children,
}: {
  href: string;
  external?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="group inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
    >
      {icon}
      <FadeSwap>
        <span className="underline decoration-line-strong underline-offset-4 transition-colors duration-200 group-hover:decoration-accent-ink">
          {children}
        </span>
      </FadeSwap>
    </a>
  );
}

/** Pie de la seccion: el resto de sitios y el proyecto tecnico. */
function MoreWork() {
  const { t } = useLanguage();
  const more = t.projects.moreWork;

  return (
    <FadeIn className="mt-24 border-t border-line pt-8 sm:mt-32">
      <FadeSwap>
        <ul className="flex flex-col gap-4 text-base sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <li>
            <a
              href="#sites"
              className="group inline-flex min-h-11 items-center gap-2 font-medium text-ink transition-colors hover:text-accent-ink"
            >
              {t.projects.moreSites.replace("{n}", String(miniProjects.length))}
              <ArrowUp
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5"
              />
            </a>
          </li>
          <li className="text-ink-muted">
            {more.lead}{" "}
            <a
              href={moreWork.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent-ink"
            >
              {more.name}
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </a>
            , {more.detail}
          </li>
        </ul>
      </FadeSwap>
    </FadeIn>
  );
}
