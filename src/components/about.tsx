"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { SectionEdge, SectionTransition } from "@/components/ui/section-transition";
import { miniProjects } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { RevealWords } from "@/components/ui/reveal-words";
import { CountUp } from "@/components/ui/count-up";

/**
 * About editorial: dos bloques de texto, cada uno con sus rasgos debajo,
 * y una columna de datos al lado.
 *
 * Es Client Component porque consume el idioma. El texto traducido se
 * envuelve en FadeSwap para que el cambio funda en lugar de saltar.
 */
export function AboutSection() {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  /*
    Datos reales, no inventados: el numero de sitios sale de la lista de
    trabajo reciente (sube solo al anadir uno), y los 32K+ son la misma
    cifra que ya cuenta el bloque de Comunicacion.
  */
  const facts = [
    { value: String(miniProjects.length), label: t.about.facts.sites, href: "#sites" },
    { value: "32K+", label: t.about.facts.audience },
    { value: "ES · EN", label: t.about.facts.languages, wide: true },
  ];

  return (
    <section
      id="about"
      className="relative z-10 overflow-x-clip bg-canvas px-5 py-24 transition-colors duration-500 sm:px-8 sm:py-28 md:px-10"
    >
      <SectionEdge />

      <SectionTransition className="relative z-10 mx-auto w-full max-w-6xl">
        <FadeIn>
          <FadeSwap>
            <p className="mb-5 text-sm font-medium text-accent-ink">
              {t.about.eyebrow}
            </p>
            <h2 className="max-w-3xl text-section font-semibold uppercase text-ink">
              <RevealWords text={t.about.title} />
            </h2>
          </FadeSwap>
          <div className="hairline mt-10 h-px w-full" />
        </FadeIn>

        {/*
          Texto a la izquierda (7 de 12), datos a la derecha (5 de 12).
          En celular los datos van primero y en dos columnas: las cifras
          grandes enganchan antes que dos parrafos seguidos.
        */}
        <div className="mt-10 grid gap-14 sm:mt-14 lg:grid-cols-12 lg:gap-16">
          <div className="flex flex-col gap-14 lg:col-span-7">
            {t.about.blocks.map((block, index) => (
              <FadeIn key={block.title} delay={0.1 + index * 0.08}>
                <article>
                  <h3 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                    {block.title}
                  </h3>

                  {/*
                    La key remonta AnimatedText al cambiar de idioma: sin
                    ella el revelado por caracteres conservaria el progreso
                    del texto anterior, que tiene otra longitud.
                  */}
                  <AnimatedText
                    key={language}
                    text={block.body}
                    className="mt-6 text-lead text-ink-muted"
                  />

                  {/*
                    Rasgos pegados al texto que los respalda. Sueltos al
                    final de la seccion competian con los datos y no se
                    sabia a que bloque respondian.
                  */}
                  <FadeSwap>
                    <ul className="mt-7 flex flex-col gap-3">
                      {block.traits.map((trait) => (
                        <li key={trait.label} className="flex gap-4">
                          <span
                            aria-hidden="true"
                            className="mt-[0.8em] h-px w-5 shrink-0 bg-accent-ink"
                          />
                          <p className="text-base leading-relaxed sm:text-lg">
                            <span className="font-medium text-ink">
                              {trait.label}
                            </span>
                            <span className="text-ink-subtle"> · {trait.detail}</span>
                          </p>
                        </li>
                      ))}
                    </ul>
                  </FadeSwap>
                </article>
              </FadeIn>
            ))}
          </div>

          {/*
            Columna de datos: cifra grande en el color del nombre. En
            escritorio acompana al texto (sticky) mientras se lee.
          */}
          <motion.dl
            className="order-first grid grid-cols-2 gap-x-6 border-t border-line lg:order-none lg:sticky lg:top-28 lg:col-span-5 lg:grid-cols-1 lg:self-start"
            initial={shouldReduceMotion ? false : "hidden"}
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
            }}
          >
            {facts.map((fact) => (
              <motion.div
                key={fact.label}
                variants={{
                  hidden: { opacity: 0, y: 28 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                  },
                }}
                className={
                  fact.wide
                    ? "col-span-2 flex flex-col gap-2 border-b border-line py-5 sm:py-6 lg:col-span-1"
                    : "flex flex-col gap-2 border-b border-line py-5 sm:py-6"
                }
              >
                <dt className="sr-only">{fact.label}</dt>
                <dd className="text-5xl font-semibold tracking-tighter text-name transition-colors duration-500 sm:text-7xl">
                  <CountUp value={fact.value} />
                </dd>
                <dd className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm text-ink-muted sm:text-lg">
                  <FadeSwap>
                    <span>{fact.label}</span>
                  </FadeSwap>
                  {fact.href ? (
                    <a
                      href={fact.href}
                      className="group inline-flex items-center gap-1 py-1 text-sm font-medium text-accent-ink"
                    >
                      {t.about.facts.sitesLink}
                      <ArrowUp
                        aria-hidden="true"
                        className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
                      />
                    </a>
                  ) : null}
                </dd>
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </SectionTransition>
    </section>
  );
}
