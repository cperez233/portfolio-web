"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { ContributionYear } from "@/lib/github-contributions";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { site } from "@/data/site";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { RevealWords } from "@/components/ui/reveal-words";
import { SectionEdge } from "@/components/ui/section-transition";
import { CountUp } from "@/components/ui/count-up";
import { GithubMark } from "@/components/ui/github-mark";
import { cn } from "@/lib/utils";
import type { Arena, ArenaColors, ArenaDay } from "./scene";

/** Tres ゴ sobre los tres dias mas fuertes. */
const GLYPH_COUNT = 3;
/** Golpes seguidos (menos de 0.7 s entre uno y otro) para la rafaga. */
const COMBO = 6;

interface Sfx {
  id: number;
  x: number;
  y: number;
  text: string;
  rotate: number;
}

function readColors(): ArenaColors {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string) => style.getPropertyValue(name).trim() || "#888";
  return {
    tile: read("--color-surface-3"),
    base: read("--color-surface-2"),
    ink: document.documentElement.classList.contains("dark") ? "#060507" : read("--color-ink"),
    accent: read("--color-accent"),
    accentStrong: document.documentElement.classList.contains("dark") ? "#fde7a6" : "#f0c75a",
    shadow: read("--panel-shadow"),
    fog: read("--color-surface"),
  };
}

function hasWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Seccion GitHub: el ultimo ano de contribuciones como un tablero 3D de
 * manga que se gira y se golpea.
 *
 * El servidor pinta el calendario plano de siempre (53 x 7), que es lo
 * que ve quien no tiene JavaScript o WebGL y lo que se ve mientras llega
 * three.js. La escena se importa cuando la seccion esta a 600px de la
 * pantalla, se pinta encima y el plano se funde.
 *
 * Easter egg: cada golpe suelta un "オラ" (y un "無駄", inutil, si el dia
 * no tiene commits). Seis golpes seguidos desatan la rafaga.
 */
export function GithubSection({ data }: { data: ContributionYear }) {
  const { t, language } = useLanguage();
  const copy = t.github;
  const reducedMotion = useReducedMotion();

  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glyphRefs = useRef<HTMLSpanElement[]>([]);
  const tipRef = useRef<HTMLDivElement>(null);
  const arenaRef = useRef<Arena | null>(null);
  const comboRef = useRef({ count: 0, last: 0 });
  const sfxId = useRef(0);

  const [ready, setReady] = useState(false);
  const [hovered, setHovered] = useState<ArenaDay | null>(null);
  const [sfx, setSfx] = useState<Sfx[]>([]);
  const [barrage, setBarrage] = useState(0);
  const touch = !useMediaQuery("(hover: hover) and (pointer: fine)");

  const dateFormat = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "es" ? "es-CO" : "en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
      }),
    [language],
  );
  const shortDate = useMemo(
    () =>
      new Intl.DateTimeFormat(language === "es" ? "es-CO" : "en-US", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      }),
    [language],
  );
  const dateOf = (index: number) => {
    const date = new Date(`${data.start}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + index);
    return dateFormat.format(date);
  };
  const countLabel = (count: number) =>
    count === 0
      ? copy.contributionsNone
      : count === 1
        ? copy.contributionsOne
        : copy.contributions.replace("{count}", String(count));

  // Carga perezosa de la escena y ciclo de vida.
  useEffect(() => {
    const panel = panelRef.current;
    const canvas = canvasRef.current;
    const tip = tipRef.current;
    if (!panel || !canvas || !tip) return;
    let disposed = false;
    let risen = false;

    const visibility = new IntersectionObserver(
      ([entry]) => {
        arenaRef.current?.setVisible(entry.isIntersecting);
        if (entry.intersectionRatio > 0.35 && !risen && arenaRef.current) {
          risen = true;
          arenaRef.current.rise();
        }
      },
      { threshold: [0, 0.35] },
    );

    const loader = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting) return;
        loader.disconnect();
        if (!hasWebGL()) return;
        const { createArena } = await import("./scene");
        if (disposed) return;
        try {
          arenaRef.current = createArena({
            canvas,
            days: data.days,
            colors: readColors(),
            reducedMotion,
            glyphs: glyphRefs.current,
            tip,
            onHover: setHovered,
            onPunch: (day) => {
              const now = performance.now();
              const combo = comboRef.current;
              combo.count = now - combo.last < 700 ? combo.count + 1 : 1;
              combo.last = now;
              const id = ++sfxId.current;
              setSfx((list) => [
                ...list.slice(-6),
                {
                  id,
                  x: day.x,
                  y: day.y,
                  text: day.count > 0 ? "オラ!" : "無駄!",
                  rotate: ((id * 37) % 24) - 12,
                },
              ]);
              window.setTimeout(() => setSfx((list) => list.filter((item) => item.id !== id)), 800);
              if (combo.count >= COMBO) {
                combo.count = 0;
                arenaRef.current?.barrage();
                setBarrage((value) => value + 1);
              }
            },
            onReady: () => setReady(true),
          });
          visibility.observe(panel);
        } catch {
          // Sin contexto WebGL real (GPU en lista negra): queda el plano.
        }
      },
      { rootMargin: "600px 0px" },
    );
    loader.observe(panel);

    // El tablero sigue al tema: html.dark cambia los tokens de color.
    const themeWatcher = new MutationObserver(() => arenaRef.current?.setColors(readColors()));
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      disposed = true;
      loader.disconnect();
      visibility.disconnect();
      themeWatcher.disconnect();
      arenaRef.current?.dispose();
      arenaRef.current = null;
    };
  }, [data.days, reducedMotion]);

  // La rafaga se borra sola.
  useEffect(() => {
    if (!barrage) return;
    const timer = window.setTimeout(() => setBarrage(0), 1500);
    return () => window.clearTimeout(timer);
  }, [barrage]);

  const chartLabel = copy.chartLabel
    .replace("{total}", String(data.total))
    .replace("{active}", String(data.activeDays));
  const maxCount = Math.max(1, ...data.days);

  return (
    <section
      id="github"
      aria-labelledby="github-title"
      className="manga-separator relative z-10 overflow-x-clip bg-canvas px-5 py-16 transition-colors duration-500 sm:px-8 sm:py-28 md:px-10"
    >
      <SectionEdge />
      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <FadeIn>
          <FadeSwap>
            <p data-part={`${t.jojo.part} 4`} className="jojo-eyebrow mb-4 text-accent-ink">
              {copy.eyebrow}
            </p>
            <h2 id="github-title" className="max-w-4xl text-section font-semibold uppercase text-ink">
              <RevealWords text={copy.title} />
            </h2>
            <p className="mt-5 max-w-2xl text-lead text-ink-muted">{copy.intro}</p>
          </FadeSwap>
        </FadeIn>

        <div className="mt-8 grid gap-6 sm:mt-14 sm:gap-8 lg:grid-cols-12 lg:gap-10">
          <FadeIn delay={0.1} y={28} className="lg:col-span-8">
            <div
              ref={panelRef}
              role="img"
              aria-label={chartLabel}
              className="manga-panel arena-panel relative h-[320px] overflow-hidden sm:h-[420px]"
            >
              <div aria-hidden="true" className="halftone halftone-fade pointer-events-none absolute inset-0 opacity-70" />

              {/* Calendario plano: sin JS, sin WebGL o mientras llega three.js. */}
              <div
                aria-hidden="true"
                className={cn(
                  "absolute inset-0 grid place-items-center px-5 transition-opacity duration-700",
                  ready && "pointer-events-none opacity-0",
                )}
              >
                <div className="grid w-full max-w-[640px] grid-flow-col grid-cols-[repeat(53,minmax(0,1fr))] grid-rows-7 gap-[2px]">
                  {data.days.map((count, i) => (
                    <span
                      key={i}
                      className="aspect-square"
                      style={{
                        background:
                          count === 0
                            ? "var(--color-surface-3)"
                            : `color-mix(in srgb, var(--color-accent) ${Math.round(45 + 55 * Math.sqrt(count / maxCount))}%, var(--color-surface-3))`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <canvas
                ref={canvasRef}
                aria-hidden="true"
                className={cn(
                  "arena-canvas absolute inset-0 size-full cursor-grab transition-opacity duration-700",
                  ready ? "opacity-100" : "opacity-0",
                )}
              />

              {/* ゴ sobre los dias mas fuertes: la escena los coloca cada frame. */}
              {Array.from({ length: GLYPH_COUNT }, (_, i) => (
                <span
                  key={i}
                  aria-hidden="true"
                  ref={(node) => {
                    if (node) glyphRefs.current[i] = node;
                  }}
                  className="arena-glyph pointer-events-none absolute left-0 top-0"
                >
                  <span style={{ animationDelay: `${i * -1.1}s` }}>ゴ</span>
                </span>
              ))}

              {/* Ficha del dia: la escena la coloca sobre la columna. */}
              <div
                ref={tipRef}
                aria-hidden="true"
                className={cn(
                  "arena-tip pointer-events-none absolute left-0 top-0 z-20",
                  !hovered && "invisible",
                )}
              >
                {hovered ? (
                  <>
                    <span className="block whitespace-nowrap text-sm font-semibold text-ink">
                      {countLabel(hovered.count)}
                    </span>
                    <span className="block whitespace-nowrap text-[13px] text-ink-muted">
                      {dateOf(hovered.index)}
                    </span>
                  </>
                ) : null}
              </div>

              {sfx.map((item) => (
                <span
                  key={item.id}
                  aria-hidden="true"
                  className="arena-sfx pointer-events-none absolute left-0 top-0 z-30"
                  style={
                    {
                      transform: `translate3d(${item.x}px, ${item.y}px, 0)`,
                      "--sfx-rotate": `${item.rotate}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span>{item.text}</span>
                </span>
              ))}

              {barrage ? (
                <div key={barrage} aria-hidden="true" className="arena-barrage pointer-events-none absolute inset-0 z-30">
                  {["オラオラオラ", "オラオラオラオラ", "オラオラ"].map((line, i) => (
                    <span key={i} style={{ animationDelay: `${i * 90}ms` }}>
                      {line}
                    </span>
                  ))}
                </div>
              ) : null}

              {ready ? (
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute bottom-3 right-3 z-10 rounded-full border border-line-strong bg-surface/90 px-3 py-1 text-[13px] text-ink-muted"
                >
                  {touch ? copy.hintTouch : copy.hintPointer}
                </span>
              ) : null}
            </div>
          </FadeIn>

          {/* Cifras: lista con filetes, no tarjetas. */}
          <FadeIn delay={0.18} y={28} className="lg:col-span-4">
            {/*
              En celular las tres cifras van en una fila: apiladas, la
              seccion medía pantalla y media.
            */}
            <dl className="grid grid-cols-3 gap-x-4 lg:grid-cols-2">
              <div className="flex flex-col gap-1 border-t border-line-strong py-4 sm:py-5 lg:col-span-2">
                <dt className="order-2 text-[15px] leading-snug text-ink-muted sm:text-base">
                  <FadeSwap>{copy.total}</FadeSwap>
                </dt>
                <dd className="order-1 font-display text-4xl leading-none tracking-wide text-name sm:text-6xl lg:text-7xl">
                  <CountUp value={String(data.total)} />
                </dd>
              </div>
              <div className="flex flex-col gap-1 border-t border-line-strong py-4 sm:py-5 lg:border-line">
                <dt className="order-2 text-[15px] leading-snug text-ink-muted sm:text-base">
                  <FadeSwap>{copy.activeDays}</FadeSwap>
                </dt>
                <dd className="order-1 font-display text-4xl leading-none tracking-wide text-ink sm:text-5xl lg:text-4xl">
                  <CountUp value={String(data.activeDays)} />
                </dd>
              </div>
              {data.best ? (
                <div className="flex flex-col gap-1 border-t border-line-strong py-4 sm:py-5 lg:border-line">
                  <dt className="order-2 text-[15px] leading-snug text-ink-muted sm:text-base">
                    <FadeSwap>
                      {copy.best.replace("{date}", shortDate.format(new Date(`${data.best.date}T00:00:00Z`)))}
                    </FadeSwap>
                  </dt>
                  <dd className="order-1 font-display text-4xl leading-none tracking-wide text-ink sm:text-5xl lg:text-4xl">
                    <CountUp value={String(data.best.count)} />
                  </dd>
                </div>
              ) : null}
              {data.years.length > 1 ? (
                <div className="col-span-3 flex flex-wrap items-baseline gap-x-5 gap-y-2 border-t border-line py-4 sm:py-5 lg:col-span-2 lg:flex-col lg:items-start">
                  <dt className="text-base font-semibold text-ink">
                    <FadeSwap>{copy.years}</FadeSwap>
                  </dt>
                  <dd className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-base text-ink-muted">
                    {data.years.map((year) => (
                      <span key={year.year}>
                        <span className="font-mono text-sm">{year.year}</span>{" "}
                        <span className="font-semibold text-ink">{year.total}</span>
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
            </dl>
            <FadeSwap>
              <p className="border-t border-line pt-4 text-[15px] leading-relaxed text-ink-subtle sm:pt-5">{copy.note}</p>
            </FadeSwap>
            <a
              href={site.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex min-h-11 items-center gap-2 text-base font-semibold text-accent-ink"
            >
              <GithubMark className="size-4 shrink-0" />
              <FadeSwap>{copy.profile}</FadeSwap>
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 shrink-0 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
