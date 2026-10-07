"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { site } from "@/data/site";
import { Menacing } from "@/components/ui/menacing";

/**
 * Cambio de seccion como la tarjeta de titulo de un capitulo de JoJo.
 *
 * Un enlace ancla lejano ya no recorre la pagina entera a toda velocidad
 * (con Lenis se veia como un barrido borroso por siete secciones): dos
 * franjas, oro y tinta, tapan la pantalla, el salto ocurre detras, y al
 * abrirse queda la placa "Parte N" con el nombre de la seccion.
 *
 * - Los destinos a menos de una pantalla y algo se siguen deslizando con
 *   Lenis: para eso no hace falta telon.
 * - Las fases van con temporizadores y no con onAnimationComplete, que no
 *   llega si la animacion se interrumpe (clics rapidos dejarian el telon
 *   puesto).
 * - Con reduced motion no intercepta nada: el salto nativo es instantaneo.
 * - Los enlaces siguen siendo <a href="#..."> de verdad; esto solo escucha
 *   el clic en la ventana, despues de los manejadores de React.
 */

const COVER_MS = 380;
const HOLD_MS = 420;
const REVEAL_MS = 560;
/** Distancia (en pantallas) a partir de la cual el salto lleva telon. */
const FAR = 1.3;

type Phase = "idle" | "cover" | "hold" | "reveal";
interface Card {
  part: string;
  title: string;
}

function readCard(target: Element | null): Card {
  if (!target) return { part: "", title: site.name };
  const part = target.querySelector("[data-part]");
  const heading = target.querySelector("h2");
  return {
    part: part?.getAttribute("data-part") ?? "",
    title: (heading?.textContent || part?.textContent || "").trim(),
  };
}

export function SectionCurtain() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [card, setCard] = useState<Card>({ part: "", title: "" });
  const busy = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timers: number[] = [];

    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (reduced.matches) return;
      const link = (event.target as Element | null)?.closest?.("a[href^='#']");
      if (!(link instanceof HTMLAnchorElement)) return;

      const hash = link.getAttribute("href") ?? "#";
      const target = hash === "#" ? null : document.getElementById(decodeURIComponent(hash.slice(1)));
      if (hash !== "#" && !target) return;

      event.preventDefault();
      if (busy.current) return;
      const lenis = window.__lenis;
      const top = target ? target.getBoundingClientRect().top + window.scrollY : 0;
      const fromKeyboard = event.detail === 0;

      const land = () => {
        if (lenis) lenis.scrollTo(top, { immediate: true, force: true });
        else window.scrollTo({ top });
        // Con teclado, el foco sigue al salto; con raton o dedo no (un
        // foco programatico pinta el anillo en algunos navegadores).
        if (fromKeyboard && target) {
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
        }
      };

      if (Math.abs(top - window.scrollY) < window.innerHeight * FAR) {
        if (lenis) lenis.scrollTo(top);
        else window.scrollTo({ top, behavior: "smooth" });
        return;
      }

      busy.current = true;
      setCard(readCard(target));
      setPhase("cover");
      timers.push(
        window.setTimeout(() => {
          land();
          setPhase("hold");
        }, COVER_MS),
        window.setTimeout(() => setPhase("reveal"), COVER_MS + HOLD_MS),
        window.setTimeout(() => {
          setPhase("idle");
          busy.current = false;
        }, COVER_MS + HOLD_MS + REVEAL_MS + 80),
      );
    }

    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  if (phase === "idle") return null;

  const slab = (delay: number) => ({
    initial: { x: "-130%" },
    animate: { x: phase === "reveal" ? "130%" : "0%" },
    transition: {
      duration: (phase === "reveal" ? REVEAL_MS : COVER_MS) / 1000,
      ease: phase === "reveal" ? ([0.7, 0, 0.84, 0] as const) : ([0.16, 1, 0.3, 1] as const),
      // El oro entra primero y sale ultimo: queda como el filo de la franja.
      delay: phase === "reveal" ? delay : 0.09 - delay,
    },
  });

  return (
    <div aria-hidden="true" className="pointer-events-auto fixed inset-0 z-[80] overflow-hidden">
      <motion.div {...slab(0.09)} className="curtain-slab curtain-slab-gold" />
      <motion.div {...slab(0)} className="curtain-slab curtain-slab-ink">
        <div className="speed-lines absolute left-1/2 top-1/2 size-[180vmax] -translate-x-1/2 -translate-y-1/2 opacity-30" />
      </motion.div>

      {phase !== "cover" ? (
        <motion.div
          initial={{ opacity: 0, scale: 1.25, rotate: -3 }}
          animate={
            phase === "reveal"
              ? { opacity: 0, x: "40%", scale: 1, rotate: 0, transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] } }
              : { opacity: 1, scale: 1, rotate: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } }
          }
          className="curtain-card absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
        >
          {card.part ? <span className="curtain-part">{card.part}</span> : null}
          <span className="curtain-title">{card.title}</span>
          <Menacing size="clamp(1.4rem, 3.2vw, 2.6rem)" className="absolute right-[8%] top-[18%]" />
          <Menacing size="clamp(1.2rem, 2.6vw, 2.2rem)" className="absolute bottom-[16%] left-[7%]" />
        </motion.div>
      ) : null}
    </div>
  );
}
