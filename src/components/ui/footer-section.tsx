"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { footerGroups, site } from "@/data/site";

/**
 * Import desde `framer-motion`, no desde `motion/react`: este proyecto
 * tiene instalada framer-motion 13 y anadir el paquete `motion`
 * embarcaria la misma libreria dos veces.
 */
export default function Footer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      id="contact"
      className="relative overflow-x-clip border-t border-line bg-canvas px-5 pb-10 pt-20 transition-colors duration-300 sm:px-8 md:px-10"
    >
      <div
        aria-hidden="true"
        className="glow-accent pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(48rem,120vw)] -translate-x-1/2"
      />

      <div className="relative mx-auto w-full max-w-6xl">
        <motion.div
          initial={
            shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }
          }
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-12 border-b border-line pb-14 lg:flex-row lg:justify-between lg:gap-16"
        >
          <div className="max-w-sm shrink-0">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent-ink">
              [ Contact ]
            </p>
            <p className="mt-5 text-2xl font-medium tracking-tight text-ink sm:text-3xl">
              Let&apos;s build something that ships.
            </p>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="accent-fill mt-7 inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-transform duration-200 ease-[var(--ease-premium)] hover:scale-[1.03] active:scale-[0.98]"
            >
              Start a conversation
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>

          {/* Cuatro columnas: navegacion, profesional, comunidad, contacto */}
          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4 lg:max-w-3xl">
            {footerGroups.map((group) => (
              <nav key={group.title} aria-label={group.title}>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-subtle">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="inline-flex min-h-11 items-center gap-1 text-sm text-ink-muted transition-colors duration-200 hover:text-accent-ink"
                      >
                        {link.label}
                        {link.external ? (
                          <ArrowUpRight
                            className="size-3 opacity-60"
                            aria-hidden="true"
                          />
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col gap-2 text-xs text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Cristian Pérez. All rights reserved.</p>
          <p className="font-mono uppercase tracking-wider">{site.location}</p>
        </div>
      </div>
    </footer>
  );
}
