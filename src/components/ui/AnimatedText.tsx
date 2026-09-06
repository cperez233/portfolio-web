"use client";

import { Fragment, useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedTextProps {
  text: string;
  className?: string;
}

/**
 * Revelado caracter a caracter dirigido por el scroll (opacidad 0.35 -> 1).
 *
 * El offset llega hasta `end 0.6` para que el recorrido termine mientras
 * el bloque sigue en pantalla: con un offset mas corto las ultimas
 * letras se quedaban apagadas y el texto no llegaba a leerse entero.
 *
 * Se parte en palabras antes que en caracteres: si cada letra fuese un
 * span suelto, el navegador podria romper la linea dentro de una palabra.
 * Cada palabra es inline-block y las letras se animan dentro.
 */
export function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.6"],
  });

  const words = text.split(" ");
  const totalChars = text.length;

  if (shouldReduceMotion) {
    return (
      <p ref={ref} className={cn(className)}>
        {text}
      </p>
    );
  }

  // Offset de cada palabra dentro del texto, precalculado: mutar un
  // contador durante el render rompe la regla de inmutabilidad de React.
  const wordStarts = words.reduce<number[]>((acc, word, index) => {
    acc.push(index === 0 ? 0 : acc[index - 1] + words[index - 1].length + 1);
    return acc;
  }, []);

  return (
    <p ref={ref} className={cn(className)}>
      {words.map((word, wordIndex) => {
        const start = wordStarts[wordIndex];

        return (
          <Fragment key={wordIndex}>
            <span className="inline-block whitespace-nowrap">
              {[...word].map((char, charIndex) => (
                <Character
                  key={charIndex}
                  progress={scrollYProgress}
                  range={[
                    (start + charIndex) / totalChars,
                    (start + charIndex + 1) / totalChars,
                  ]}
                >
                  {char}
                </Character>
              ))}
            </span>
            {/* Fuera del span: aqui es donde la linea puede romper. */}
            {wordIndex < words.length - 1 ? " " : null}
          </Fragment>
        );
      })}
    </p>
  );
}

interface CharacterProps {
  children: React.ReactNode;
  progress: MotionValue<number>;
  range: [number, number];
}

function Character({ children, progress, range }: CharacterProps) {
  const opacity = useTransform(progress, range, [0.35, 1]);
  return <motion.span style={{ opacity }}>{children}</motion.span>;
}
