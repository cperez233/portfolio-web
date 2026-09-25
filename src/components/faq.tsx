"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight, Plus } from "lucide-react";
import { fillPlanPrices } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { Magnetic } from "@/components/ui/magnetic";
import { SectionEdge } from "@/components/ui/section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const listVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rowVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

/**
 * Preguntas frecuentes: acordeon animado y, al lado, una tarjeta para
 * preguntar por WhatsApp lo que no este.
 *
 * Las respuestas estan siempre en el HTML (cerradas solo miden 0 de
 * alto), asi que Google y los buscadores de IA las leen igual. Son las
 * mismas que van como FAQPage en el JSON-LD (json-ld.tsx).
 *
 * Los precios salen de site.ts, no del texto: si cambia un plan, la
 * respuesta cambia con el.
 */
export function FaqSection() {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      aria-labelledby="faq-title"
      className="layer-top relative z-30 -mt-8 overflow-x-clip rounded-t-[32px] bg-canvas px-5 py-20 transition-colors duration-500 sm:rounded-t-[48px] sm:px-8 sm:py-28 md:px-10"
    >
      <SectionEdge />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <FadeIn>
              <FadeSwap>
                <p className="mb-4 text-sm font-medium text-accent-ink">{t.faq.eyebrow}</p>
                <h2
                  id="faq-title"
                  className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-5xl"
                >
                  <RevealWords text={t.faq.title} />
                </h2>
              </FadeSwap>
            </FadeIn>

            {/* Escritorio: la tarjeta acompana a las preguntas. */}
            <AskCard className="mt-10 hidden lg:block" />
          </div>
        </div>

        <motion.ul
          className="border-t border-line lg:col-span-8"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={listVariants}
        >
          {t.faq.items.map((item, index) => {
            const isOpen = open === index;
            const panelId = `faq-panel-${index}`;
            return (
              <motion.li key={index} variants={rowVariants} className="relative border-b border-line">
                {/* Filo de acento de la pregunta abierta. */}
                <motion.span
                  aria-hidden="true"
                  initial={false}
                  animate={{ scaleY: isOpen ? 1 : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.4, ease }}
                  className="absolute -left-3 bottom-4 top-4 w-0.5 origin-top rounded-full bg-accent-ink sm:-left-5"
                />
                <FadeSwap>
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : index)}
                      className={cn(
                        "group flex min-h-16 w-full items-center justify-between gap-6 py-4 text-left text-lg font-medium tracking-tight transition-colors duration-300",
                        isOpen ? "text-accent-ink" : "text-ink hover:text-accent-ink",
                      )}
                    >
                      {item.question}
                      <motion.span
                        aria-hidden="true"
                        initial={false}
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                          "inline-flex size-9 shrink-0 items-center justify-center rounded-full border transition-colors duration-300",
                          isOpen
                            ? "accent-fill border-transparent"
                            : "border-line-strong text-accent-ink group-hover:border-accent",
                        )}
                      >
                        <Plus className="size-4" />
                      </motion.span>
                    </button>
                  </h3>
                  <motion.div
                    id={panelId}
                    role="region"
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: shouldReduceMotion ? 0 : 0.45, ease }}
                    className="overflow-hidden"
                  >
                    <motion.p
                      initial={false}
                      animate={{ y: isOpen ? 0 : -8 }}
                      transition={{ duration: 0.45, ease }}
                      className="max-w-2xl pb-6 pr-12 text-base leading-relaxed text-ink-muted"
                    >
                      {fillPlanPrices(item.answer, language)}
                    </motion.p>
                  </motion.div>
                </FadeSwap>
              </motion.li>
            );
          })}
        </motion.ul>

        {/* Celular: la tarjeta cierra la seccion. */}
        <AskCard className="lg:hidden" />
      </div>
    </section>
  );
}

/** Tarjeta para preguntar por WhatsApp lo que no esta en la lista. */
function AskCard({ className }: { className?: string }) {
  const { t, language } = useLanguage();
  const ask = t.faq.ask;

  return (
    <FadeIn delay={0.15} y={24} className={className}>
      <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-surface p-6 shadow-[var(--tech-card-shadow)] transition-colors duration-500 sm:p-7">
        <div
          aria-hidden="true"
          className="glow-accent pointer-events-none absolute -bottom-28 -right-24 size-64 opacity-60"
        />
        <FadeSwap className="relative">
          <p className="text-xl font-medium tracking-tight text-ink">{ask.title}</p>
          <p className="mt-2 text-base leading-relaxed text-ink-muted">{ask.body}</p>
        </FadeSwap>
        <div className="relative mt-6">
          <Magnetic>
            <a
              href={buildWhatsappUrl(ask.whatsappMessage)}
              onClick={() => trackWhatsappClick("faq", language)}
              target="_blank"
              rel="noopener noreferrer"
              className="accent-fill group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-transform duration-200 ease-[var(--ease-premium)] hover:scale-[1.03] active:scale-[0.98]"
            >
              {ask.cta}
              <ArrowUpRight
                aria-hidden="true"
                className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          </Magnetic>
        </div>
      </div>
    </FadeIn>
  );
}
