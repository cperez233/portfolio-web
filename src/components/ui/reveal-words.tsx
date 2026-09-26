"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface RevealWordsProps {
  text: string;
  /** Retardo antes de la primera palabra, en segundos. */
  delay?: number;
}

/**
 * Titulo que sube palabra por palabra desde una mascara al entrar en
 * pantalla. Va DENTRO del encabezado (`<h2><RevealWords /></h2>`), asi
 * que el tamano y el color los pone quien lo usa.
 *
 * Cada palabra se recorta con overflow-hidden. El padding arriba y
 * abajo, compensado con margen negativo, da aire a las tildes de las
 * mayusculas ("MÍ") y a los descendentes, que si no quedarian cortados
 * con el leading apretado de los titulos.
 *
 * La key por texto hace que al cambiar de idioma el titulo nuevo vuelva
 * a entrar en lugar de aparecer de golpe.
 *
 * El texto existe una sola vez en el HTML: las palabras animadas son el
 * titulo. Con una copia sr-only mas otra aria-hidden, buscadores y
 * extractores de texto leian "About meAbout me".
 */
export function RevealWords({ text, delay = 0 }: RevealWordsProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) return <>{text}</>;

  const words = text.split(" ");

  return (
    <span key={text} className="inline">
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          <span className="-my-[0.14em] inline-block overflow-hidden py-[0.14em] align-bottom">
            <motion.span
              className="inline-block"
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.85, delay: delay + i * 0.07, ease }}
            >
              {word}
            </motion.span>
          </span>
          {/* Fuera del inline-block: dentro, el espacio final se colapsa
              y las palabras se pegaban ("SOBREMÍ"). */}
          {i < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </span>
  );
}
