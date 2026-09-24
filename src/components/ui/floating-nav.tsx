"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { navLinks } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

/*
  Mismo --ease-premium (cubic-bezier(0.22,1,0.36,1)) que ya usa el resto
  del sitio (portfolio-hero.tsx, projects.tsx), para que el gesto del
  icono no desentone del resto de las transiciones.
*/
const hamburgerTransition = { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const };

/*
  Panel movil: cae desde la pildora y se repliega hacia ella. Solo
  opacidad y transform: animar `filter` en el propio panel anularia su
  backdrop-filter (el vidrio) en algunos navegadores.

  Entrada y salida tienen curvas distintas a proposito. La entrada usa
  la ease-out del sitio, que frena al llegar. Con esa misma curva la
  salida hacia casi todo el cambio en los primeros 60ms y el panel se
  apagaba de golpe, sin llegar a verse cerrar. Por eso la salida es
  ease-in-out, la opacidad va 80ms por detras del movimiento (se ve la
  forma recogerse antes de desaparecer) y los enlaces se van en orden
  inverso, de abajo arriba.
*/
const panelVariants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.94,
    // Deja de capturar toques en cuanto empieza a cerrarse, no al final.
    pointerEvents: "none" as const,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
      opacity: { duration: 0.22, delay: 0.08, ease: "easeIn" as const },
      staggerChildren: 0.035,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: "auto" as const,
    transition: {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

const panelItemVariants = {
  closed: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: "easeIn" as const },
  },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const hamburgerLineVariants = {
  top: {
    closed: { rotate: 0, y: -6 },
    open: { rotate: 45, y: 0 },
  },
  middle: {
    closed: { opacity: 1 },
    open: { opacity: 0 },
  },
  bottom: {
    closed: { rotate: 0, y: 6 },
    open: { rotate: -45, y: 0 },
  },
};

/**
 * Pildora flotante persistente. Vive en el layout, no dentro del hero,
 * para que acompane a toda la pagina.
 *
 * Bajo `md` los enlaces se pliegan en un panel desplegable: cuatro
 * enlaces mas los dos controles no caben en 360px sin desbordar.
 */
export function FloatingNav() {
  const { t } = useLanguage();
  // La verdad del tema vive en la clase de <html>; el store solo la lee
  // y la escribe, de modo que el icono no puede desincronizarse.
  const { isDark, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  /*
    Arriba del todo la pildora casi se funde con el hero; en cuanto la
    pagina se mueve gana fondo y sombra para separarse del contenido que
    pasa por debajo. setState con el mismo booleano no re-renderiza, asi
    que el listener solo cuesta algo al cruzar el umbral.
  */
  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        panelRef.current &&
        toggleRef.current &&
        !panelRef.current.contains(event.target as Node) &&
        !toggleRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  /*
    Reflejo que sigue al raton por la pildora: solo con raton, en tactil
    se queda en su sitio. Al salir, la variable vuelve a su valor inicial
    (@property en globals.css) y el reflejo se desliza de vuelta.
  */
  const handleGlassPointerMove = (event: PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    event.currentTarget.style.setProperty("--glass-x", `${Math.round(x)}%`);
  };

  const handleGlassPointerLeave = (event: PointerEvent<HTMLElement>) => {
    event.currentTarget.style.removeProperty("--glass-x");
  };

  // whitespace-nowrap: sin el, "Sobre mí" se partia en dos lineas y la
  // pildora crecia en alto.
  const linkClass =
    "inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-2.5 text-base text-ink-muted transition-colors duration-200 ease-[var(--ease-premium)] hover:text-ink";

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-fit -translate-x-1/2">
      <nav
        aria-label={t.nav.about}
        data-scrolled={isScrolled}
        onPointerMove={handleGlassPointerMove}
        onPointerLeave={handleGlassPointerLeave}
        className={cn(
          /*
            Liquid glass: fondo, desenfoque con saturacion, canto de luz y
            sombras viven en `.liquid-glass` (globals.css), que lee el
            tema y `data-scrolled`. Aqui solo queda la forma.
          */
          "liquid-glass flex items-center gap-3 rounded-full px-4 py-2 sm:gap-6 sm:px-6 sm:py-2.5",
        )}
      >
        {/* Enlaces en linea a partir de md */}
        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.key}>
              <a href={link.href} className={linkClass}>
                {t.nav[link.key]}
              </a>
            </li>
          ))}
        </ul>

        {/* Version compacta por debajo de md */}
        <motion.button
          ref={toggleRef}
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          whileTap={{ scale: 0.92 }}
          aria-expanded={isOpen}
          aria-controls="floating-nav-panel"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="relative inline-flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:text-ink md:hidden"
        >
          <motion.span
            aria-hidden="true"
            className="absolute h-0.5 w-5 rounded-full bg-current"
            variants={hamburgerLineVariants.top}
            animate={isOpen ? "open" : "closed"}
            transition={hamburgerTransition}
          />
          <motion.span
            aria-hidden="true"
            className="absolute h-0.5 w-5 rounded-full bg-current"
            variants={hamburgerLineVariants.middle}
            animate={isOpen ? "open" : "closed"}
            transition={hamburgerTransition}
          />
          <motion.span
            aria-hidden="true"
            className="absolute h-0.5 w-5 rounded-full bg-current"
            variants={hamburgerLineVariants.bottom}
            animate={isOpen ? "open" : "closed"}
            transition={hamburgerTransition}
          />
        </motion.button>

        <span
          aria-hidden="true"
          className="h-5 w-px shrink-0 bg-line-strong"
        />

        <LanguageToggle />

        <button
          type="button"
          onClick={toggleTheme}
          className="glass-chip inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:text-accent-ink"
          aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          aria-pressed={isDark}
        >
          {isDark ? (
            <Sun className="size-4" aria-hidden="true" />
          ) : (
            <Moon className="size-4" aria-hidden="true" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            key="floating-nav-panel"
            id="floating-nav-panel"
            ref={panelRef}
            data-scrolled="true"
            variants={panelVariants}
            initial={shouldReduceMotion ? false : "closed"}
            animate="open"
            exit={shouldReduceMotion ? { opacity: 0, transition: { duration: 0 } } : "closed"}
            style={{ transformOrigin: "top center" }}
            className="liquid-glass mt-2 rounded-2xl p-2 md:hidden"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <motion.li key={link.key} variants={panelItemVariants}>
                  <a
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex min-h-11 items-center rounded-xl px-4 text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
                  >
                    {t.nav[link.key]}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
