"use client";

import { useRef } from "react";
import { invisibleSignature } from "@/lib/signature";
import { SecretsCounter } from "@/components/secrets";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ArrowUpRight } from "lucide-react";
import { footerGroups, hero, site } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { PRIVACY_PATHS } from "@/lib/language-detection";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { ContactForm } from "./contact-form";
import { FadeSwap } from "./FadeSwap";
import { Magnetic } from "./magnetic";
import { RevealWords } from "./reveal-words";
import { SectionEdge } from "./section-transition";
import { Menacing3D } from "@/components/jojo-3d/menacing-3d";

/**
 * Import desde `framer-motion`, no desde `motion/react`: este proyecto
 * tiene instalada framer-motion 13 y anadir el paquete `motion`
 * embarcaria la misma libreria dos veces.
 */
export default function Footer() {
  const shouldReduceMotion = useReducedMotion();
  const { t, language } = useLanguage();
  const year = 2026;
  const footerRef = useRef<HTMLElement>(null);

  /*
    Cierre: el nombre del hero vuelve en gigante al final de la pagina y
    sube desde abajo mientras el footer entra. Recorrido corto (35% de su
    alto) para que se lea como una capa que asoma, no como un efecto.
  */
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"],
  });
  const wordmarkY = useTransform(scrollYProgress, [0, 1], ["35%", "0%"]);

  return (
    <footer
      ref={footerRef}
      id="contact"
      className="relative z-40 overflow-x-clip border-t border-line bg-canvas px-5 pb-0 pt-20 transition-colors duration-500 sm:px-8 md:px-10"
    >
      <SectionEdge />
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
          /*
            En escritorio, dos columnas que se llenan las dos: a la
            izquierda el saludo y, al pie, los enlaces; a la derecha el
            formulario entero. Antes el formulario colgaba bajo el saludo y
            los enlaces dejaban media pantalla vacia a la derecha. En
            celular el orden sigue igual: saludo, formulario, enlaces.
          */
          className="grid gap-12 border-b border-line pb-14 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-10"
        >
          <div className="w-full max-w-xl min-w-0 lg:col-span-5 lg:row-start-1 lg:max-w-none">
            <FadeSwap>
              <p data-part={`${t.jojo.part} 9`} className="jojo-eyebrow text-accent-ink">
                {t.footer.eyebrow}
              </p>
              {/* El "¿Oh? ¿Te acercas?" de Dio, en globo de manga. */}
              <p data-spot="contact" className="jojo-bubble mt-6">{t.jojo.approach}</p>
              <p className="mt-5 text-2xl font-medium tracking-tight text-ink sm:text-3xl">
                <RevealWords text={t.footer.headline} />
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink-muted">
                {t.footer.availability}
              </p>
            </FadeSwap>

            <div className="mt-7">
            <Magnetic>
            <a
              href={buildWhatsappUrl(t.whatsappMessage)}
              onClick={() => trackWhatsappClick("footer", language)}
              target="_blank"
              rel="noopener noreferrer"
              className="accent-fill group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-transform duration-200 ease-[var(--ease-premium)] hover:scale-[1.03] active:scale-[0.98]"
            >
              {t.footer.cta}
              <ArrowUpRight
                className="size-4 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            </Magnetic>
            </div>
          </div>

          <div className="relative min-w-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-col">
            {/* ゴゴゴ en 3D asomando por la esquina de la carta: tiembla, sigue al puntero y late al tocarlo. */}
            <Menacing3D
              fallbackSize="clamp(1.4rem, 3vw, 2.4rem)"
              className="absolute -right-2 -top-24 z-10 h-28 w-20 sm:-top-28 sm:h-36 sm:w-24 lg:-right-8 lg:-top-16 lg:h-40 lg:w-24"
            />
            <ContactForm />
          </div>

          {/* Tres columnas: navegacion, redes, contacto */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-5 lg:row-start-2 lg:self-end lg:gap-6 lg:border-t lg:border-line lg:pt-8">
            {footerGroups.map((group) => (
              <nav key={group.key} aria-label={t.footer.groups[group.key]}>
                <FadeSwap>
                  <p className="text-sm font-medium text-ink-subtle">
                    {t.footer.groups[group.key]}
                  </p>
                </FadeSwap>
                <ul className="mt-4 space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        {...(link.external
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                        className="group inline-flex min-h-11 items-center gap-1 text-base text-ink-muted transition-colors duration-200 hover:text-accent-ink"
                      >
                        {/* Subrayado que se dibuja de izquierda a derecha. */}
                        <span className="relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-[var(--ease-premium)] group-hover:after:scale-x-100">
                          {/* Los nombres propios no se traducen. */}
                          {link.labelKey ? t.footer.links[link.labelKey] : link.label}
                        </span>
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

        <div className="mt-8 flex flex-col gap-2 text-sm text-ink-subtle sm:flex-row sm:items-center sm:justify-between">
          <FadeSwap>
            <p>
              &copy; {year} {site.name}. {t.footer.rights}
              {invisibleSignature}
            </p>
          </FadeSwap>
          <div className="flex items-center justify-between gap-6">
            <a
              href={PRIVACY_PATHS[language]}
              className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline"
            >
              {t.footer.privacy}
            </a>
            <SecretsCounter />
            <p>{site.location}</p>
          </div>
        </div>

        {/*
          Cierre de capitulo: la flecha "To Be Continued" entra desde la
          izquierda cuando el final de la pagina llega a pantalla, como
          el congelado del final de cada episodio.
        */}
        {/*
          El observador va en el contenedor quieto: la flecha empieza
          fuera de su caja, y si se observara a si misma nunca "entraria".
        */}
        <motion.div
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.8 }}
          className="mt-12 flex items-center justify-between gap-6 overflow-x-clip py-1"
        >
          <motion.div
            variants={{
              hidden: { x: "-120%", opacity: 0 },
              show: { x: 0, opacity: 1 },
            }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            data-spot="tbc"
            className="tbc-arrow ml-1"
          >
            <span className="tbc-arrow-text">{t.jojo.toBeContinued}</span>
          </motion.div>
          <p className="shrink-0 text-right text-base font-bold text-ink">
            {t.jojo.farewell}
            {/* Firma con una linea delante, sin raya larga (se lee como texto de IA). */}
            <span className="flex items-center justify-end gap-2 text-sm font-normal text-ink-subtle">
              <span aria-hidden="true" className="h-px w-5 bg-current" />
              Cris
            </span>
          </p>
        </motion.div>
      </div>

      {/*
        Decorativo (aria-hidden): el nombre ya sale en el hero. Ancho
        completo, fuera del contenedor de 6xl, y recortado por abajo por
        el overflow del footer para que asome desde el borde.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative -mx-5 mt-14 select-none overflow-hidden sm:-mx-8 md:-mx-10"
      >
        <motion.p
          style={shouldReduceMotion ? undefined : { y: wordmarkY }}
          className="whitespace-nowrap pt-[0.16em] text-center font-display text-[13.5vw] uppercase leading-[0.84] tracking-[0.01em] text-name transition-colors duration-500"
        >
          {hero.firstName} {hero.lastName}
        </motion.p>
      </div>
    </footer>
  );
}
