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
import { projects, type Project } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl } from "@/lib/contact";
import { TechVisual } from "@/components/diagrams";
import { BackgroundOrbs } from "@/components/ui/background-orbs";
import { GithubMark } from "@/components/ui/github-mark";
import { FadeIn } from "@/components/ui/FadeIn";
import { SectionEdge } from "@/components/ui/section-transition";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { cn } from "@/lib/utils";

/**
 * Tarjetas pegajosas que se apilan al hacer scroll, en todos los
 * viewports.
 *
 * Un unico useScroll sobre el contenedor alimenta las tres: medir cada
 * tarjeta por separado no es fiable una vez esta pegada al viewport.
 *
 * En movil la tarjeta se fija mas abajo (`top-24`, para dejar sitio a la
 * navbar flotante) y con una altura contenida (`74svh` en vez del
 * `86svh` de escritorio): su contenido completo (contexto, solucion,
 * impacto y las tres muestras) no cabe siempre en ese alto, asi que el
 * cuerpo de la tarjeta se vuelve scrolleable por su cuenta
 * (`overflow-y-auto`) en vez de recortarse.
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
      <SectionEdge />
      <BackgroundOrbs variant="wide" />

      <FadeIn className="relative z-10 mx-auto mb-14 w-full max-w-6xl">
        <FadeSwap>
          <p className="mb-4 font-mono text-sm uppercase tracking-[0.28em] text-accent-ink">
            {t.projects.eyebrow}
          </p>
          <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
            {t.projects.title}
          </h2>
        </FadeSwap>
      </FadeIn>

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
    <article
      className={cn(
        "flex h-full w-full flex-col gap-5 rounded-[32px] border border-line-strong bg-surface p-5 sm:rounded-[40px] sm:p-8",
        "overflow-y-auto scrollbar-hide md:overflow-hidden",
      )}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-6">
          <p className="shrink-0 font-mono text-sm text-accent-ink">
            {project.number}
          </p>

          <div className="min-w-0">
            <FadeSwap>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-subtle">
                {copy.category}
              </p>
              <h3 className="mt-2 text-balance text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                {copy.name}
              </h3>
              <p className="mt-1 text-base text-ink-muted">{copy.tagline}</p>
            </FadeSwap>
            {/* Stack: nombres propios, no se traducen. */}
            <ul aria-label="Stack" className="mt-3 flex flex-wrap gap-1.5">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-line bg-surface-2 px-2 py-1 font-mono text-[11px] uppercase tracking-wider text-ink-muted"
                >
                  {tech}
                </li>
              ))}
            </ul>

            {/* Micro-datos de impacto, donde el stack no lo cuenta ya. */}
            {copy.metrics ? (
              <FadeSwap className="mt-3">
                <ul className="flex flex-wrap gap-2">
                  {copy.metrics.map((metric) => (
                    <li
                      key={metric}
                      className="rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-accent-ink"
                    >
                      {metric}
                    </li>
                  ))}
                </ul>
              </FadeSwap>
            ) : null}
          </div>
        </div>

        <FadeSwap className="shrink-0">
          {/* Con repositorio, el CTA lleva al codigo; sin el, a WhatsApp. */}
          <a
            href={project.repoUrl ?? buildWhatsappUrl(t.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-6 text-sm uppercase tracking-wider text-ink transition-colors duration-200 ease-[var(--ease-premium)] hover:border-accent hover:text-accent-ink"
          >
            {project.repoUrl ? <GithubMark className="size-4" /> : null}
            {project.repoUrl ? t.projects.repoCta : copy.cta}
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
              <dt className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">
                {t.projects.labels[key]}
              </dt>
              <dd className="mt-2 text-base leading-relaxed text-ink-muted">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </FadeSwap>

      <ProjectVisual project={project} captions={copy.showcase} />
    </article>
  );

  if (reduceMotion) {
    return <div className="mb-6 last:mb-0">{card}</div>;
  }

  return (
    <div
      className="project-stack sticky top-24 h-[74svh] md:h-[86svh]"
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

/**
 * Diagrama tecnico o galeria de capturas, segun el proyecto.
 *
 * En movil va a su altura natural (la tarjeta se desplaza por dentro);
 * desde `md` ocupa el alto que deja libre la tarjeta fijada.
 */
function ProjectVisual({
  project,
  captions,
}: {
  project: Project;
  captions?: [string, string, string];
}) {
  const { visual } = project;

  if (visual.kind === "diagram") {
    return (
      <TechVisual
        id={visual.diagram}
        className="shrink-0 md:min-h-0 md:flex-1"
      />
    );
  }

  const [first, second, third] = visual.images;
  const labels = captions ?? ["", "", ""];

  return (
    <>
      {/*
        40% dos muestras apiladas, 60% una alta.

        En movil es `flex-col` a proposito, no `grid`: con grid, la fila
        del par de miniaturas (un hijo flex sin alto propio) media 0px
        de alto y la muestra grande quedaba encima de las otras dos en
        vez de debajo. El grid de 5 columnas solo hace falta desde `sm:`.
      */}
      <div className="flex flex-col gap-3 sm:grid sm:min-h-0 sm:flex-1 sm:grid-cols-5">
        <div className="flex min-h-0 flex-col gap-3 sm:col-span-2">
          <ShowcaseTile src={first} label={labels[0]} className="min-h-20 flex-1" />
          <ShowcaseTile src={second} label={labels[1]} className="min-h-20 flex-1" />
        </div>
        <ShowcaseTile
          src={third}
          label={labels[2]}
          className="h-40 sm:h-auto sm:min-h-0 sm:col-span-3"
        />
      </div>
    </>
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
        <p className="font-mono text-xs uppercase tracking-wider text-white">
          {label}
        </p>
      </FadeSwap>
    </div>
  );
}
