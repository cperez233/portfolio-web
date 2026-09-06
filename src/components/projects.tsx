"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { projects, site, type Project, type ProjectShowcase } from "@/data/site";
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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="projects"
      className="overflow-x-clip bg-canvas px-5 pb-24 pt-24 sm:px-8 md:px-10"
    >
      <div className="mx-auto mb-14 w-full max-w-6xl">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-accent">
          [ 03 ]
        </p>
        <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
          Projects
        </h2>
      </div>

      <div ref={containerRef} className="mx-auto w-full max-w-6xl">
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
  const targetScale = 1 - (total - 1 - index) * 0.03;
  const scale = useTransform(progress, [index / total, 1], [1, targetScale]);

  const card = (
    <article className="flex h-full w-full flex-col gap-6 rounded-[32px] border border-line-strong bg-surface p-5 sm:rounded-[40px] sm:p-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <p className="shrink-0 font-mono text-sm text-accent">
            {project.number}
          </p>

          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-subtle">
              {project.category}
            </p>
            <h3 className="mt-2 text-balance text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              {project.name}
            </h3>
            <p className="mt-1 text-sm text-ink-muted">{project.tagline}</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-wider text-ink-subtle">
              {project.stack}
            </p>
          </div>
        </div>

        <a
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border border-line-strong px-5 text-xs uppercase tracking-wider text-ink transition-colors duration-200 ease-[var(--ease-premium)] hover:border-accent hover:text-accent"
        >
          Discuss this
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>

      {/* 40% dos muestras apiladas, 60% una alta */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-5">
        <div className="flex min-h-0 flex-col gap-3 sm:col-span-2">
          <ShowcaseTile item={project.showcase[0]} className="min-h-24 flex-1" />
          <ShowcaseTile item={project.showcase[1]} className="min-h-24 flex-1" />
        </div>
        <ShowcaseTile
          item={project.showcase[2]}
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
      className="sticky top-24 h-[78svh] md:top-28"
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

const tones: Record<ProjectShowcase["tone"], string> = {
  lime: "from-[#c3e41d]/25 via-[#1b2005] to-[#101010]",
  violet: "from-[#7621b0]/40 via-[#200a29] to-[#101010]",
  amber: "from-[#be4c00]/35 via-[#241408] to-[#101010]",
  slate: "from-[#646973]/40 via-[#1e2126] to-[#101010]",
};

/**
 * Placeholder de muestra. Sustituir por capturas reales del proyecto:
 * la maqueta ya reserva el hueco exacto.
 */
function ShowcaseTile({
  item,
  className,
}: {
  item: ProjectShowcase;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-end overflow-hidden rounded-2xl bg-gradient-to-br p-4 sm:rounded-3xl sm:p-5",
        tones[item.tone],
        className,
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-ink-muted">
        {item.label}
      </p>
    </div>
  );
}
