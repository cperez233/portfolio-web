"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { miniProjects, type MiniProject } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { isTimeStopped } from "@/lib/time-stop";
import { emitStandEvent } from "@/lib/stand-events";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { BackgroundOrbs } from "@/components/ui/background-orbs";
import {
  SectionEdge,
  SectionTransition,
} from "@/components/ui/section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { Testimonials } from "@/components/testimonials";
import { cn } from "@/lib/utils";

/**
 * Trabajo reciente: una tira de sitios publicados justo debajo del hero.
 *
 * Sustituye a la banda de texto. Lo que entra primero por los ojos de
 * quien contrata es trabajo terminado y en linea, no una lista de
 * herramientas.
 *
 * La misma tira en celular y en escritorio (SiteStrip): deriva sola en
 * bucle para que se vea que hay mas de cuatro sitios, y se agarra con el
 * dedo o el raton para moverla a gusto. Al soltarla sigue con el impulso
 * y despues retoma la deriva hacia el lado al que la lanzaste. Antes en
 * celular era un carrusel quieto con snap y en escritorio una animacion
 * CSS que solo se podia pausar.
 *
 * La tira va repetida tres veces y cruza el borde de la pantalla, asi que
 * es solo para puntero (aria-hidden): con teclado el foco caeria en
 * tarjetas invisibles. Teclado y lector de pantalla usan una lista de
 * enlaces oculta que solo se ve cuando recibe el foco.
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
            <p data-part={`${t.jojo.part} 1`} className="jojo-eyebrow mb-4 text-accent-ink">
              {t.miniProjects.eyebrow}
            </p>
            <h2 data-spot="sites"
              id="mini-projects-title"
              className="max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl"
            >
              <RevealWords text={t.miniProjects.title} />
            </h2>
            <p className="mt-4 text-lead text-ink-muted">
              {t.miniProjects.hint}
            </p>
          </FadeSwap>
        </FadeIn>

        <SiteStrip
          caption={(index) => t.miniProjects.items[index]}
          imageAlt={(name) => `${t.miniProjects.imageAlt} ${name}`}
        />

        {/*
          Sin pildoras visibles: repetian los enlaces de las tarjetas y
          solo metian ruido. Pero la tira va con aria-hidden (esta
          triplicada y cruza el borde de la pantalla), asi que esta lista
          es el unico camino para teclado y lector de pantalla. Queda
          oculta y aparece solo cuando el foco entra en ella.
        */}
        <ul className="sr-only focus-within:not-sr-only focus-within:mx-auto focus-within:mt-10 focus-within:flex focus-within:w-full focus-within:max-w-6xl focus-within:flex-wrap focus-within:justify-center focus-within:gap-2.5 focus-within:px-5 sm:focus-within:px-10">
          {miniProjects.map((project) => (
            <li key={project.key}>
              <a
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-4 text-sm font-medium text-ink"
              >
                {project.name}
                <ArrowUpRight aria-hidden="true" className="size-4" />
                <span className="sr-only">{t.miniProjects.newTab}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Resenas de clientes, junto a sus paginas. */}
        <div className="mx-auto w-full max-w-6xl px-5 sm:px-8 md:px-10">
          <Testimonials />
        </div>
      </SectionTransition>
    </section>
  );
}

/** Px por segundo de la deriva sola. En celular, mas lenta: se alcanza a leer. */
const DRIFT = { fine: 46, touch: 30 };

/**
 * La tira de sitios: deriva sola y se arrastra.
 *
 * El desplazamiento lo lleva un bucle de requestAnimationFrame y no una
 * animacion CSS, porque hay que poder agarrarla a mitad de camino:
 * - Con el dedo o el raton se mueve a la par del puntero. Al soltarla
 *   sigue con la velocidad que llevaba y frena poco a poco hasta la
 *   deriva, que desde ahi va hacia el lado al que la lanzaste.
 * - Bajo el raton se detiene, para leer la tarjeta y pulsarla.
 * - La rueda horizontal (trackpad) tambien la mueve.
 * - Un arrastre no abre el enlace: el clic que llega al soltar se descarta.
 * - En celular el gesto vertical sigue siendo scroll de pagina
 *   (touch-action: pan-y); solo el horizontal mueve la tira.
 *
 * Como la tira lleva el contenido tres veces, el desplazamiento se da
 * vuelta cada vez que recorre un tercio y el bucle no tiene costura.
 * Fuera de pantalla y con el tiempo detenido (ZA WARUDO) no avanza. Con
 * reduced motion no deriva, pero se puede arrastrar.
 */
function SiteStrip({
  caption,
  imageAlt,
}: {
  caption: (index: number) => string;
  imageAlt: (name: string) => string;
}) {
  const viewRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reducedMotion = Boolean(useReducedMotion());

  useEffect(() => {
    const view = viewRef.current;
    const track = trackRef.current;
    if (!view || !track) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const drift = reducedMotion ? 0 : fine ? DRIFT.fine : DRIFT.touch;

    let offset = 0;
    let velocity = -drift;
    let direction = -1;
    let hovered = false;
    let visible = false;
    let raf = 0;
    let last = performance.now();
    // Hasta cuando sigue quieta despues de soltarla con el dedo (lectura).
    let restUntil = 0;
    let drag: { id: number; x: number; y: number; start: number; moved: boolean; samples: { t: number; x: number }[] } | null = null;
    let swallowClick = false;
    let lastFling = 0;

    const period = () => track.scrollWidth / 3;
    function place() {
      const p = period();
      if (p > 0) {
        offset %= p;
        if (offset > 0) offset -= p;
      }
      track!.style.transform = `translate3d(${offset.toFixed(2)}px, 0, 0)`;
    }

    function tick(now: number) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!isTimeStopped() && !drag) {
        const target = hovered || now < restUntil ? 0 : drift * direction;
        // Despues de un lanzamiento frena en ~1.5s; hacia la deriva, suave.
        const ease = Math.abs(velocity) > Math.abs(target) + 1 ? 1.8 : 1.1;
        velocity += (target - velocity) * (1 - Math.exp(-ease * dt));
        offset += velocity * dt;
        place();
      }
      raf = visible ? requestAnimationFrame(tick) : 0;
    }
    function start() {
      if (raf || !visible) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      start();
    });
    observer.observe(view);

    const onDown = (event: PointerEvent) => {
      if (event.button !== 0 || isTimeStopped()) return;
      drag = { id: event.pointerId, x: event.clientX, y: event.clientY, start: offset, moved: false, samples: [{ t: event.timeStamp, x: event.clientX }] };
      velocity = 0;
    };
    const onMove = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const dx = event.clientX - drag.x;
      const dy = event.clientY - drag.y;
      if (!drag.moved) {
        if (Math.abs(dx) < 6) return;
        // Gesto vertical: es scroll de pagina, no de la tira.
        if (Math.abs(dy) > Math.abs(dx)) {
          drag = null;
          return;
        }
        drag.moved = true;
        view.setPointerCapture(event.pointerId);
        view.classList.add("is-dragging");
      }
      offset = drag.start + dx;
      place();
      drag.samples.push({ t: event.timeStamp, x: event.clientX });
      if (drag.samples.length > 6) drag.samples.shift();
    };
    const onUp = (event: PointerEvent) => {
      if (!drag || event.pointerId !== drag.id) return;
      const { moved, samples } = drag;
      drag = null;
      view.classList.remove("is-dragging");
      if (!moved) return;
      swallowClick = true;
      window.setTimeout(() => (swallowClick = false), 0);
      // Velocidad de los ultimos ~100ms del gesto (o del ultimo tramo, si
      // los eventos llegan espaciados). Si se quedo quieto antes de
      // soltar, no hay lanzamiento.
      const end = samples[samples.length - 1];
      let from = samples.find((s) => end.t - s.t < 100);
      if (!from || from === end) from = samples[Math.max(0, samples.length - 2)];
      const span = Math.max(16, end.t - from.t);
      const still = event.timeStamp - end.t > 90;
      velocity = still ? 0 : Math.max(-4200, Math.min(4200, ((end.x - from.x) / span) * 1000));
      if (Math.abs(velocity) > 120) direction = velocity > 0 ? 1 : -1;
      if (!fine) restUntil = performance.now() + (Math.abs(velocity) > 400 ? 0 : 2200);
      // Un buen lanzamiento: el mini Stand lo comenta.
      if (Math.abs(velocity) > 1500 && performance.now() - lastFling > 4000) {
        lastFling = performance.now();
        emitStandEvent("spin");
      }
      start();
    };
    const onClick = (event: MouseEvent) => {
      if (!swallowClick) return;
      event.preventDefault();
      event.stopPropagation();
      swallowClick = false;
    };
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
      event.preventDefault();
      offset -= event.deltaX;
      velocity = 0;
      if (Math.abs(event.deltaX) > 2) direction = event.deltaX > 0 ? -1 : 1;
      place();
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType === "mouse") hovered = true;
    };
    const onLeave = () => {
      hovered = false;
    };

    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);
    view.addEventListener("click", onClick, true);
    view.addEventListener("wheel", onWheel, { passive: false });
    view.addEventListener("pointerenter", onEnter);
    view.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      view.removeEventListener("pointerdown", onDown);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerup", onUp);
      view.removeEventListener("pointercancel", onUp);
      view.removeEventListener("click", onClick, true);
      view.removeEventListener("wheel", onWheel);
      view.removeEventListener("pointerenter", onEnter);
      view.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <div
      ref={viewRef}
      aria-hidden="true"
      data-lenis-prevent-horizontal
      className="site-strip marquee-fade mt-8 overflow-x-clip sm:mt-16"
    >
      <div ref={trackRef} className="flex w-max gap-5 py-3 will-change-transform sm:gap-7">
        {[0, 1, 2].map((copy) =>
          miniProjects.map((project, index) => (
            <SiteCard
              key={`${copy}-${project.key}`}
              project={project}
              index={index}
              caption={caption(index)}
              imageAlt={imageAlt(project.name)}
            />
          )),
        )}
      </div>
    </div>
  );
}

interface SiteCardProps {
  project: MiniProject;
  /** Posicion en la lista: alterna el ladeo de la vineta. */
  index: number;
  caption: string;
  /** Alt de la captura: buscadores de imagenes y quien no la ve. */
  imageAlt: string;
}

/**
 * Captura enmarcada en una ventana de navegador minima. La barra con el
 * dominio es lo que hace que se lea como "pagina real" y no como
 * ilustracion.
 */
function SiteCard({
  project,
  index,
  caption,
  imageAlt,
}: SiteCardProps) {
  return (
    <a
      href={project.href}
      tabIndex={-1}
      target="_blank"
      rel="noopener noreferrer"
      // Sin el arrastre nativo de enlaces e imagenes: lo maneja la tira.
      draggable={false}
      // En celular, 76vw deja ver el borde de la siguiente: se entiende
      // que hay mas. En escritorio, con 20rem entran cuatro tarjetas
      // completas mas dos asomando.
      className="group block w-[76vw] max-w-80 shrink-0 sm:w-80"
    >
      {/*
        will-change-[translate], no will-change-transform: Tailwind v4
        anima `-translate-y-1` con la propiedad `translate` (CSS
        Transforms Level 2), no con `transform`. Son propiedades
        distintas, asi que `will-change-transform` no promovia nada y
        Chrome/Edge en Windows seguia creando la capa GPU recien al
        arrancar el hover: el combo overflow-hidden + border-radius +
        una propiedad de transformacion recien creada es lo que dispara
        el parpadeo en el borde redondeado.
      */}
      <div
        className={cn(
          "site-panel overflow-hidden bg-surface will-change-[translate] group-hover:-translate-y-1",
          index % 2 === 1 && "is-even",
        )}
      >
        {/* La barra con el dominio es ahora el cartel de tinta de la vineta. */}
        <div className="site-panel-bar flex items-center gap-3 px-4 py-2">
          <span className="flex shrink-0 gap-1">
            <span className="size-2 bg-accent" />
            <span className="size-2 bg-canvas/50" />
            <span className="size-2 bg-canvas/30" />
          </span>
          <span className="min-w-0 truncate font-mono text-xs text-canvas/80">
            {project.domain}
          </span>
        </div>

        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={project.image}
            alt={imageAlt}
            fill
            // eager: la tira se mueve de lado, y con lazy las tarjetas
            // que entran desde fuera aparecerian vacias un instante. Son
            // cinco archivos (~280 KB) compartidos por las tres copias.
            loading="eager"
            draggable={false}
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
