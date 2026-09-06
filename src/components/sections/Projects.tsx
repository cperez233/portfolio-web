"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { LiveProjectButton } from "@/components/ui/LiveProjectButton";
import { projects, type Project, type ProjectShowcase } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Tarjetas pegajosas que se apilan. Un unico useScroll sobre el
 * contenedor alimenta las tres: medir cada tarjeta por separado no es
 * fiable una vez esta pegada al viewport.
 */
export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 overflow-x-clip rounded-t-[40px] bg-[#0C0C0C] px-5 pb-20 pt-20 sm:rounded-t-[60px] sm:px-8 md:-mt-14 md:px-10"
    >
      <h2
        className="hero-heading text-center font-black uppercase leading-none tracking-tight"
        style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
      >
        Projects
      </h2>

      <div ref={containerRef} className="mx-auto mt-16 w-full max-w-7xl">
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
    <div className="flex h-full w-full flex-col gap-6 rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[60px] sm:p-6 md:p-8">
      {/* Fila superior */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <p className="shrink-0 text-4xl font-black leading-none tracking-tight text-[#D7E2EA] sm:text-6xl">
            {project.number}
          </p>
          <div className="min-w-0">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#D7E2EA]/60">
              {project.category}
            </p>
            <h3 className="text-balance text-xl font-medium tracking-tight text-[#D7E2EA] sm:text-2xl md:text-3xl">
              {project.name}
            </h3>
            <p className="mt-1 text-xs text-[#D7E2EA]/60 sm:text-sm">
              {project.tagline}
            </p>
          </div>
        </div>

        <LiveProjectButton href={project.cta.href} className="shrink-0">
          {project.cta.label}
        </LiveProjectButton>
      </div>

      {/* Fila inferior: 40% dos imagenes apiladas, 60% una alta */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-5">
        <div className="flex min-h-0 flex-col gap-3 sm:col-span-2">
          <ShowcaseTile item={project.showcase[0]} className="min-h-0 flex-1" />
          <ShowcaseTile item={project.showcase[1]} className="min-h-0 flex-1" />
        </div>
        <ShowcaseTile
          item={project.showcase[2]}
          className="hidden min-h-0 sm:col-span-3 sm:block"
        />
      </div>
    </div>
  );

  if (reduceMotion) {
    return <div className="mb-6 h-[85vh]">{card}</div>;
  }

  return (
    <div
      className="sticky h-[85vh] top-24 md:top-32"
      style={{ paddingTop: `${index * 28}px` }}
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
  violet: "from-[#7621B0]/55 via-[#2a0733] to-[#150a1a]",
  amber: "from-[#BE4C00]/50 via-[#2a1608] to-[#170d05]",
  slate: "from-[#646973]/55 via-[#232830] to-[#14161a]",
};

/**
 * Placeholder de showcase. Sustituir por capturas reales del proyecto
 * en cuanto esten disponibles: la maqueta ya reserva el hueco exacto.
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
        "flex items-end overflow-hidden rounded-[30px] bg-gradient-to-br p-4 sm:rounded-[40px] sm:p-6",
        tones[item.tone],
        className,
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-wider text-[#D7E2EA]/70">
        {item.label}
      </p>
    </div>
  );
}
