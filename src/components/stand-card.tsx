"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { Menacing } from "@/components/ui/menacing";
import { standStats } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";

/*
  Geometria del radar. Seis ejes empezando arriba y en sentido horario,
  el mismo orden que la tarjeta del README (破壊力 arriba).
*/
const CX = 260;
const CY = 232;
const R = 118;
const GRADE_VALUE: Record<string, number> = { A: 1, B: 0.8, C: 0.45, D: 0.3, E: 0.15 };

function point(index: number, radius: number) {
  const angle = -Math.PI / 2 + (index * Math.PI) / 3;
  return { x: CX + radius * Math.cos(angle), y: CY + radius * Math.sin(angle) };
}

function ring(radius: number) {
  return standStats
    .map((_, i) => {
      const p = point(i, radius);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");
}

const statsPolygon = standStats
  .map((stat, i) => {
    const p = point(i, R * GRADE_VALUE[stat.grade]);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  })
  .join(" ");

/**
 * Grafica de Stand: hexagono con las seis notas. El poligono dorado crece
 * desde el centro al entrar en pantalla y cada nota cae con un rebote,
 * como el "golpe" de la tarjeta animada del README.
 */
function StandRadar() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <svg
      viewBox="0 0 520 470"
      role="img"
      aria-label={t.jojo.stand.chartLabel}
      className="h-auto w-full max-w-[520px]"
    >
      {[0.2, 0.4, 0.6, 0.8].map((f) => (
        <polygon
          key={f}
          points={ring(R * f)}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="1"
        />
      ))}
      <polygon
        points={ring(R)}
        fill="none"
        stroke="var(--color-ink)"
        strokeWidth="2.5"
      />
      {standStats.map((_, i) => {
        const p = point(i, R);
        return (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={p.x}
            y2={p.y}
            stroke="var(--color-line)"
            strokeWidth="1"
          />
        );
      })}

      <motion.polygon
        points={statsPolygon}
        fill="var(--color-accent)"
        fillOpacity="0.35"
        stroke="var(--color-accent)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        style={{ transformOrigin: `${CX}px ${CY}px` }}
        initial={shouldReduceMotion ? false : { scale: 0, rotate: -40 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 1.2, ease: [0.2, 0.9, 0.2, 1.15], delay: 0.2 }}
      />

      {standStats.map((stat, i) => {
        const p = point(i, R + 44);
        const top = i === 0;
        const bottom = i === 3;
        const right = p.x > CX + 1;
        const anchor = top || bottom ? "middle" : right ? "start" : "end";
        const labelX = top || bottom ? p.x : p.x + (right ? 30 : -30);
        const labelY = top ? p.y - 52 : bottom ? p.y + 44 : p.y - 4;

        return (
          <g key={stat.jp}>
            <motion.g
              style={{ transformOrigin: `${p.x}px ${p.y}px` }}
              initial={shouldReduceMotion ? false : { scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                type: "spring",
                stiffness: 420,
                damping: 14,
                delay: 0.7 + i * 0.09,
              }}
            >
              <circle
                cx={p.x}
                cy={p.y}
                r="21"
                fill="var(--color-canvas)"
                stroke="var(--color-ink)"
                strokeWidth="2.5"
              />
              <text
                x={p.x}
                y={p.y + 10}
                textAnchor="middle"
                fontFamily="var(--font-display)"
                fontSize="28"
                fill="var(--color-name)"
              >
                {stat.grade}
              </text>
            </motion.g>
            {/*
              Etiquetas dentro de la grafica solo desde sm: en un celular
              la grafica mide ~340px y el texto quedaba en unos 8px, con
              los kanji ilegibles. Ahi van en la leyenda de debajo.
            */}
            <g className="max-sm:hidden">
              <text
                x={labelX}
                y={labelY}
                textAnchor={anchor}
                fontFamily="var(--font-jp)"
                fontSize="17"
                fill="var(--color-ink)"
              >
                {stat.jp}
              </text>
              <text
                x={labelX}
                y={labelY + 20}
                textAnchor={anchor}
                fontFamily="var(--font-sans)"
                fontSize="15"
                fill="var(--color-ink-subtle)"
              >
                {t.jojo.stand.stats[i]}
              </text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}

/**
 * Tarjeta de Stand, la del README de perfil, en tamano vineta: cierra la
 * pagina de manga de Sobre mi (no es una seccion propia). Dos vinetas
 * separadas por un corte diagonal en escritorio; en celular se apilan
 * rectas. Compacta a proposito: cabe entera en una pantalla de 600px.
 */
export function StandCard({ className }: { className?: string }) {
  const { t } = useLanguage();
  const copy = t.jojo.stand;

  return (
    <FadeIn className={cn("relative", className)}>
      {/*
        Caja de narrador: explica que es un Stand a quien no conoce JoJo,
        para que la tarjeta no se lea como algo raro.
      */}
      <FadeSwap>
        <p className="manga-caption mb-6 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base">
          <span className="manga-caption-tab">{copy.explainerTitle}</span>
          {copy.explainer}
        </p>
      </FadeSwap>
      <div className="grid gap-4 lg:grid-cols-12 lg:gap-0">
        {/* Vineta 1: nombre del Stand y su usuario */}
        <div className="manga-panel manga-panel-cut-right halftone-corner relative lg:col-span-7 lg:-mr-6">
          <div className="relative px-6 py-6 sm:px-8 sm:py-7 lg:pr-16">
            <FadeSwap>
              <p className="font-display text-xs uppercase tracking-[0.3em] text-ink-subtle">
                {copy.label}
              </p>
              <h3 className="stand-name relative mt-2 inline-block px-4 font-display text-4xl font-normal uppercase leading-[0.95] tracking-[0.01em] text-ink sm:text-5xl">
                {copy.name}
              </h3>
              <p
                aria-hidden="true"
                className="mt-2 font-jp text-base tracking-[0.12em] text-accent-ink"
              >
                {copy.nameJp}
              </p>
              <p className="mt-4 text-base font-bold text-ink">{copy.user}</p>
              <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-ink-muted sm:text-base">
                {copy.description}
              </p>
            </FadeSwap>
          </div>
        </div>

        {/* Vineta 2: la grafica, con lineas de velocidad detras */}
        <div className="manga-panel manga-panel-cut-left relative overflow-hidden lg:col-span-5 lg:-ml-3">
          <div
            aria-hidden="true"
            className="speed-lines pointer-events-none absolute left-1/2 top-1/2 size-[160%] -translate-x-1/2 -translate-y-1/2"
          />
          <div className="relative flex h-full flex-col items-center justify-center px-2 py-3 lg:pl-10">
            <div className="w-full max-w-[340px]">
              <StandRadar />
            </div>
            {/* Leyenda en celular: nota, atributo en japones y su nombre. */}
            <ul aria-hidden="true" className="relative grid w-full grid-cols-2 gap-x-3 gap-y-2 px-3 pb-3 sm:hidden">
              {standStats.map((stat, i) => (
                <li key={stat.jp} className="flex items-center gap-2">
                  <span className="stand-grade">{stat.grade}</span>
                  <span className="min-w-0 leading-tight">
                    <span className="block font-jp text-sm text-ink">{stat.jp}</span>
                    <span className="block text-xs text-ink-subtle">{copy.stats[i]}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Menacing
        size="clamp(1.2rem, 2.2vw, 2rem)"
        className="absolute -top-7 right-2 z-10 sm:right-5"
      />
    </FadeIn>
  );
}
