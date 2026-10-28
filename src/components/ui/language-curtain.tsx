/* editorial-ui · Cristian Pérez · cristianperez.me */
"use client";

import { motion } from "framer-motion";
import type { Language } from "@/data/content";

/**
 * Cambio de idioma como una viñeta que se abre desde el boton pulsado.
 *
 * Un disco de oro con filo de tinta crece desde el centro
 * del boton EN/ES hasta tapar la pantalla; encima sale el nombre del
 * idioma de destino, en su propio idioma. El texto de la pagina cambia
 * mientras todo esta tapado (lo orquesta lib/language.tsx con
 * temporizadores) y los discos vuelven a meterse en el boton.
 *
 * Solo pinta: no sabe de idiomas ni de tiempos. Decorativo (aria-hidden);
 * el anuncio para lectores de pantalla lo hace el proveedor. Mientras
 * esta puesto se traga los clics, para que nadie toque nada a medias.
 */

export type CurtainPhase = "cover" | "reveal";

export interface CurtainState {
  to: Language;
  /** Centro del boton pulsado, en px de la ventana. */
  x: number;
  y: number;
  /** Radio que cubre la esquina mas lejana. */
  radius: number;
  phase: CurtainPhase;
}

/** Cada idioma se nombra en si mismo; la linea en katakana es decoracion. */
const NAMES: Record<Language, { word: string; jp: string }> = {
  en: { word: "English", jp: "英語" },
  es: { word: "Español", jp: "スペイン語" },
};

export const CURTAIN_COVER_MS = 520;
export const CURTAIN_HOLD_MS = 380;
export const CURTAIN_REVEAL_MS = 520;

/* Grosor del filo: el disco de tinta va siempre este tanto por delante del de oro. */
const EDGE = 14;
const easeIn = [0.7, 0, 0.84, 0] as const;
const easeOut = [0.16, 1, 0.3, 1] as const;

function circle(radius: number, x: number, y: number) {
  return `circle(${radius}px at ${x}px ${y}px)`;
}

export function LanguageCurtain({ state }: { state: CurtainState }) {
  const { to, x, y, radius, phase } = state;
  const covering = phase === "cover";
  const name = NAMES[to];

  /*
    Los dos discos con la misma curva y el mismo tiempo: el filo crece al
    abrir y se adelgaza hasta cero al cerrar, sin quedar un punto suelto.
  */
  const disc = (extra: number) => ({
    initial: { clipPath: circle(0, x, y) },
    animate: { clipPath: circle(covering ? radius + extra : 0, x, y) },
    transition: {
      duration: (covering ? CURTAIN_COVER_MS : CURTAIN_REVEAL_MS) / 1000,
      ease: covering ? easeOut : easeIn,
    },
  });

  return (
    <div aria-hidden="true" className="lang-curtain pointer-events-auto fixed inset-0 z-[90] overflow-hidden">
      <motion.div {...disc(EDGE)} className="lang-disc-edge absolute inset-0" />
      <motion.div {...disc(0)} className="lang-disc-gold absolute inset-0 overflow-hidden">
        <div className="speed-lines absolute left-1/2 top-1/2 size-[180vmax] -translate-x-1/2 -translate-y-1/2" />
        <motion.div
          initial={{ opacity: 0, scale: 1.35, rotate: -8 }}
          animate={
            covering
              ? { opacity: 1, scale: 1, rotate: -4, transition: { duration: 0.34, ease: easeOut, delay: 0.24 } }
              : { opacity: 0, scale: 0.9, rotate: -4, transition: { duration: 0.18, ease: easeIn } }
          }
          lang={to}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-6 text-center"
        >
          <span className="lang-curtain-jp">{name.jp}</span>
          <span className="lang-curtain-word">{name.word}</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
