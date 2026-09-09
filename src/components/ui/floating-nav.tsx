"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

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

  const linkClass =
    "inline-flex min-h-9 items-center rounded-full px-2.5 text-base text-ink-muted transition-colors duration-200 ease-[var(--ease-premium)] hover:text-ink";

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[calc(100%-1.5rem)] max-w-fit -translate-x-1/2">
      <nav
        aria-label={t.nav.about}
        className={cn(
          "flex items-center gap-3 rounded-full border border-line-strong bg-canvas/75 px-4 py-2",
          "shadow-2xl backdrop-blur-xl sm:gap-6 sm:px-6 sm:py-2.5",
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
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-ink-muted transition-colors duration-200 hover:text-accent-ink"
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

      {isOpen ? (
        <div
          id="floating-nav-panel"
          ref={panelRef}
          className="mt-2 rounded-2xl border border-line-strong bg-canvas/95 p-2 shadow-2xl backdrop-blur-xl md:hidden"
        >
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.key}>
                <a
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex min-h-11 items-center rounded-xl px-4 text-sm text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
                >
                  {t.nav[link.key]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
