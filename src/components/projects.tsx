"use client";

import { useRef } from "react";
import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, site, type Project } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { BackgroundOrbs } from "@/components/ui/background-orbs";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { cn } from "@/lib/utils";

/**
 * Tarjetas pegajosas que se apilan al hacer scroll.
 *
 * Un unico useScroll sobre el contenedor alimenta las tres: medir cada
 * tarjeta por separado no es fiable una vez esta pegada al viewport.
 */
export function ProjectsSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { t } = useLanguage();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="projects"
      className="layer-top relative z-30 -mt-8 overflow-x-clip rounded-t-[32px] bg-canvas px-5 pb-24 pt-24 transition-colors duration-500 sm:rounded-t-[48px] sm:px-8 md:px-10"
    >
      <BackgroundOrbs variant="wide" />

      <div className="relative z-10 mx-auto mb-14 w-full max-w-6xl">
        <FadeSwap>
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-accent-ink">
            {t.projects.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
            {t.projects.title}
          </h2>
        </FadeSwap>
      </div>

      <div ref={containerRef} className="relative z-10 mx-auto w-full max-w-6xl">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.number}
            project={project}
            index={index}
            total={projects.length}
            progress={scrollYProgress}
            reduceMotion={Boolean(shouldReduceMotion)}
          />
        ))}
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}

function ProjectCard({
  project,
  index,
  total,
  progress,
  reduceMotion,
}: ProjectCardProps) {
  const { t } = useLanguage();
  const copy = t.projects.items[index];

  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  const card = (
    <article className="flex h-full w-full flex-col gap-5 overflow-hidden rounded-[32px] border border-line-strong bg-surface p-5 sm:rounded-[40px] sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <p className="shrink-0 font-mono text-sm text-accent-ink">
            {project.number}
          </p>

          <div className="min-w-0">
            <FadeSwap>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-subtle">
                {copy.category}
              </p>
              <h3 className="mt-2 text-balance text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                {copy.name}
              </h3>
              <p className="mt-1 text-sm text-ink-muted">{copy.tagline}</p>
            </FadeSwap>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
              {project.stack}
            </p>

            {/* Micro-datos de impacto */}
            <FadeSwap className="mt-4">
              <ul className="flex flex-wrap gap-2">
                {copy.metrics.map((metric) => (
                  <li
                    key={metric}
                    className="rounded-full border border-line-strong bg-surface-2 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent-ink"
                  >
                    {metric}
                  </li>
                ))}
              </ul>
            </FadeSwap>
          </div>
        </div>

        <FadeSwap className="shrink-0">
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-5 text-xs uppercase tracking-wider text-ink transition-colors duration-200 ease-[var(--ease-premium)] hover:border-accent hover:text-accent-ink"
          >
            {copy.cta}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </FadeSwap>
      </div>

      {/* Contexto / Solucion / Impacto */}
      <FadeSwap>
        <dl className="grid gap-4 border-y border-line py-5 sm:grid-cols-3 sm:gap-6">
          {(
            [
              ["context", copy.context],
              ["solution", copy.solution],
              ["impact", copy.impact],
            ] as const
          ).map(([key, value]) => (
            <div key={key} className="min-w-0">
              <dt className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent-ink">
                {t.projects.labels[key]}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-ink-muted">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </FadeSwap>

      {/* 40% dos muestras apiladas, 60% una alta */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-5">
        <div className="flex min-h-0 flex-col gap-3 sm:col-span-2">
          <ShowcaseTile
            src={project.showcase[0]}
            label={copy.showcase[0]}
            className="min-h-20 flex-1"
          />
          <ShowcaseTile
            src={project.showcase[1]}
            label={copy.showcase[1]}
            className="min-h-20 flex-1"
          />
        </div>
        <ShowcaseTile
          src={project.showcase[2]}
          label={copy.showcase[2]}
          className="hidden min-h-0 sm:col-span-3 sm:block"
        />
      </div>
    </article>
  );

  if (reduceMotion) {
    return <div className="mb-6 min-h-[70svh]">{card}</div>;
  }

  return (
    <div
      className="sticky top-20 h-[86svh] md:top-24"
      style={{ paddingTop: `${index * 24}px` }}
    >
      <motion.div
        style={{ scale, willChange: "transform" }}
        className="h-full origin-top"
      >
        {card}
      </motion.div>
    </div>
  );
}

function ShowcaseTile({
  src,
  label,
  className,
}: {
  src: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-line bg-surface-2",
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        aria-hidden="true"
        fill
        loading="lazy"
        sizes="(min-width: 640px) 40vw, 100vw"
        // object-top: son capturas de pantalla, y el encuadre util
        // esta arriba. Centrarlas cortaria la cabecera de la interfaz.
        className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
      />
      {/* Velo inferior: mantiene la etiqueta legible sobre la foto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent"
      />
      <FadeSwap className="absolute bottom-0 left-0 p-4 sm:p-5">
        <p className="font-mono text-[11px] uppercase tracking-wider text-white">
          {label}
        </p>
      </FadeSwap>
    </div>
  );
}
