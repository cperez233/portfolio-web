"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLanguage } from "@/lib/language";
import type { Language } from "@/data/content";
import { cn } from "@/lib/utils";

const options: Language[] = ["en", "es"];

/**
 * Pastilla deslizante [ EN | ES ]. La pildora activa se mueve con un
 * `layoutId` de Framer Motion, asi que la transicion la calcula el
 * propio motor de layout en vez de posiciones fijas.
 */
export function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="group"
      aria-label={t.languageToggle.label}
      className="glass-chip relative inline-flex h-11 items-center rounded-full p-1"
    >
      {options.map((option) => {
        const isActive = option === language;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            aria-pressed={isActive}
            className={cn(
              "relative z-10 inline-flex h-9 min-w-11 items-center justify-center rounded-full px-3",
              "font-mono text-xs uppercase tracking-wider transition-colors duration-200",
              isActive ? "text-white" : "text-ink-subtle hover:text-ink",
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="language-pill"
                className="accent-fill absolute inset-0 -z-10 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_14px_-4px_rgba(101,42,49,0.7)]"
                transition={
                  shouldReduceMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 420, damping: 34 }
                }
              />
            ) : null}
            {option}
          </button>
        );
      })}
    </div>
  );
}
