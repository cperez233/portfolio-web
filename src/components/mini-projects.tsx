"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { miniProjects, type MiniProject } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { BackgroundOrbs } from "@/components/ui/background-orbs";
import {
  SectionEdge,
  SectionTransition,
} from "@/components/ui/section-transition";

/**
 * Trabajo reciente: una tira de sitios publicados justo debajo del hero.
 *
 * Sustituye a la banda de texto. Lo que entra primero por los ojos de
 * quien contrata es trabajo terminado y en linea, no una lista de
 * herramientas.
 *
 * Dos montajes segun el ancho, elegidos por CSS y no por JS: asi no hay
 * parpadeo al hidratar y el que sobra, al ir en display:none, no es
 * enfocable ni existe para el lector de pantalla.
 *
 * - Hasta md: carrusel que se arrastra con el dedo y engancha tarjeta a
 *   tarjeta. En 390px solo cabe una tarjeta y media, y con la tira en
 *   movimiento ninguna quedaba entera: los nombres se partian a media
 *   palabra.
 * - Desde md: la tira deriva sola en bucle (.marquee-drift). Antes se
 *   movia solo con el scroll, y quien se quedaba quieto veia cuatro
 *   sitios sin saber que habia mas; ahora desfilan los cinco. Se detiene
 *   bajo el raton para leer y pulsar. Es solo para puntero: esta repetida
 *   tres veces y cruza el borde de la pantalla, asi que con teclado el
 *   foco caeria en tarjetas invisibles.
 *
 * Los enlaces de debajo sirven a teclado y lector de pantalla cuando
 * manda la tira, y de indice para todos en cualquier ancho.
 */
export function MiniProjectsSection() {
  const { t } = useLanguage();

  return (
    <section
      id="sites"
      aria-labelledby="mini-projects-title"
      className="layer-top relative z-10 overflow-x-clip rounded-t-[32px] bg-canvas py-20 transition-colors duration-500 sm:rounded-t-[48px] sm:py-28"
    >
      <SectionEdge />
      <BackgroundOrbs variant="top" />

      <SectionTransition className="relative z-10">
        <FadeIn className="mx-auto w-full max-w-6xl px-5 sm:px-8 md:px-10">
          <FadeSwap>
            <p className="mb-4 font-mono text-sm uppercase tracking-[0.28em] text-accent-ink">
              {t.miniProjects.eyebrow}
            </p>
            <h2
              id="mini-projects-title"
              className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl"
            >
              {t.miniProjects.title}
            </h2>
            <p className="mt-4 text-lead text-ink-muted">
              {t.miniProjects.hint}
            </p>
          </FadeSwap>
        </FadeIn>

        <ul
          data-lenis-prevent
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
        >
          {miniProjects.map((project, index) => (
            <li key={project.key} className="snap-start">
              <SiteCard
                project={project}
                caption={t.miniProjects.items[index]}
                focusable
              />
            </li>
          ))}
        </ul>

        <div
          aria-hidden="true"
          className="marquee-fade mt-12 hidden overflow-x-clip sm:mt-16 md:block"
        >
          <div className="marquee-drift flex w-max gap-4 sm:gap-6">
            {[0, 1, 2].map((copy) =>
              miniProjects.map((project, index) => (
                <SiteCard
                  key={`${copy}-${project.key}`}
                  project={project}
                  caption={t.miniProjects.items[index]}
                />
              )),
            )}
          </div>
        </div>

        <ul className="mx-auto mt-10 flex w-full max-w-6xl flex-wrap justify-center gap-2.5 px-5 sm:mt-12 sm:px-8 md:px-10">
          {miniProjects.map((project) => (
            <li key={project.key}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-4 text-sm font-medium text-ink transition-colors duration-200 hover:border-accent-ink hover:text-accent-ink"
              >
                {project.name}
                <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only">{t.miniProjects.newTab}</span>
              </a>
            </li>
          ))}
        </ul>
      </SectionTransition>
    </section>
  );
}

interface SiteCardProps {
  project: MiniProject;
  caption: string;
  /** Solo en el carrusel: en la tira el foco caeria fuera de pantalla. */
  focusable?: boolean;
}

/**
 * Captura enmarcada en una ventana de navegador minima. La barra con el
 * dominio es lo que hace que se lea como "pagina real" y no como
 * ilustracion.
 */
function SiteCard({ project, caption, focusable = false }: SiteCardProps) {
  return (
    <a
      href={project.href}
      tabIndex={focusable ? undefined : -1}
      target="_blank"
      rel="noopener noreferrer"
      // En celular, 80vw deja ver el borde de la siguiente: se entiende
      // que hay mas y que se arrastra. De md en adelante manda la tira,
      // y con 20rem entran cuatro tarjetas completas mas dos asomando.
      className="group block w-[80vw] max-w-80 shrink-0 sm:w-80"
    >
      {/*
        will-change-transform: sin promover la capa a GPU de antemano,
        Chrome/Edge en Windows puede parpadear un frame en el borde
        redondeado justo al arrancar el `-translate-y-1` del hover
        (overflow-hidden + border-radius + transform recien iniciado es
        el combo clasico que dispara el glitch).
      */}
      <div className="overflow-hidden rounded-2xl border border-line-strong bg-surface transition-transform duration-300 ease-premium will-change-transform group-hover:-translate-y-1">
        <div className="flex items-center gap-3 border-b border-line bg-surface-2 px-4 py-2.5">
          <span className="flex shrink-0 gap-1.5">
            <span className="size-2 rounded-full bg-line-strong" />
            <span className="size-2 rounded-full bg-line-strong" />
            <span className="size-2 rounded-full bg-line-strong" />
          </span>
          <span className="min-w-0 truncate rounded-md bg-canvas px-3 py-1 font-mono text-xs text-ink-subtle">
            {project.domain}
          </span>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.image}
            alt=""
            fill
            // eager: la tira se mueve de lado, y con lazy las tarjetas
            // que entran desde fuera aparecerian vacias un instante. Son
            // cinco archivos (~280 KB) compartidos por las tres copias.
            loading="eager"
            sizes="(min-width: 640px) 320px, 80vw"
            // object-top: el encuadre util de una web esta arriba.
            className="object-cover object-top transition-transform duration-500 ease-premium group-hover:scale-[1.03]"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 px-1">
        <p className="text-lg font-medium tracking-tight text-ink">
          {project.name}
        </p>
        <ArrowUpRight className="size-4 shrink-0 text-accent-ink transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="mt-1 px-1 text-base text-ink-muted">{caption}</p>
    </a>
  );
}
