"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Menu, X, ChevronDown, ArrowUpRight, Moon, Sun } from "lucide-react";
import { hero, navLinks, portrait, site } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { LanguageToggle } from "./LanguageToggle";
import { FadeSwap } from "./FadeSwap";

interface BlurTextProps {
  text: string;
  delay?: number;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  className?: string;
  style?: React.CSSProperties;
}

const BlurText: React.FC<BlurTextProps> = ({
  text,
  delay = 50,
  animateBy = "words",
  direction = "top",
  className = "",
  style,
}) => {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  const segments = useMemo(() => {
    return animateBy === "words" ? text.split(" ") : text.split("");
  }, [text, animateBy]);

  // Sin `flex-wrap` fijo: quien llama decide si la linea puede romper.
  // El nombre monumental necesita `flex-nowrap` para no partirse.
  return (
    <p ref={ref} className={`inline-flex ${className}`} style={style}>
      {segments.map((segment, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            filter: inView ? "blur(0px)" : "blur(10px)",
            opacity: inView ? 1 : 0,
            transform: inView
              ? "translateY(0)"
              : `translateY(${direction === "top" ? "-20px" : "20px"})`,
            transition: `all 0.5s ease-out ${i * delay}ms`,
          }}
        >
          {segment}
          {animateBy === "words" && i < segments.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
};

/*
  El nombre se revela letra a letra: "CRISTIAN" son 8 letras a 90ms de
  retardo mas 500ms de transicion, asi que termina cerca de 1.13s. El
  copy arranca en 1.0s para encadenar sin dejar un hueco muerto.
*/
const copyContainerVariants = {
  hidden: {},
  visible: { transition: { delayChildren: 1, staggerChildren: 0.08 } },
};

const copyItemVariants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function PortfolioHero() {
  const { t } = useLanguage();
  // El servidor ya pinta <html class="dark">, asi que `true` coincide con
  // la primera pintura: no hace falta leer el DOM ni hay parpadeo. Este
  // estado solo refleja el icono del boton; la verdad vive en <html>.
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  /*
    Capa fora.so: el hero queda pegado y las secciones siguientes se
    deslizan por encima mientras el retrocede en escala y opacidad.

    El ref va en el envoltorio EXTERNO, que no es sticky. Medir el propio
    elemento pegado no funciona: su rect se queda clavado en top 0 y el
    progreso nunca avanza de 0.
  */
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const layerScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const layerOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.45]);

  /** Alterna `.dark` en <html>: de ahi cuelga el tema de todo el sitio. */
  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  /*
    Escala del nombre. "CRISTIAN" son 8 caracteres y Fira Code avanza
    0.6em cada uno; con `tracking-tighter` (-0.05em) queda en 0.55em.
    A 14vw eso son 8 x 0.55 x 14vw = 61.6vw: entra de sobra en una linea.
    El contenedor va a ancho completo a proposito: un `max-w` fijo era lo
    que partia "CRISTIAN" en "CRISTI / AN" en pantallas anchas.

    Color solido (token --color-name), no gradiente. Dos razones: cada
    letra de BlurText lleva un `filter` inline, y un filter crea contexto
    de apilado que rompe background-clip:text; y los gradientes no
    interpolan, asi que el nombre saltaria de golpe al cambiar de tema
    mientras el resto funde en 500ms.
  */
  const nameClassName =
    "w-full flex-nowrap justify-center whitespace-nowrap text-name transition-colors duration-500 text-[11vw] font-black uppercase leading-[0.8] tracking-tighter select-none sm:text-[12vw] md:text-[13vw] lg:text-[14vw]";

  return (
    <div ref={heroRef} className="relative z-0 h-svh min-h-[600px]">
      <div className="sticky top-0 h-svh min-h-[600px] overflow-x-clip bg-canvas transition-colors duration-500">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 px-6 py-6">
        <nav className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              className="p-2 text-ink-muted transition-colors duration-300 hover:text-ink"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-8 w-8" strokeWidth={2} />
              ) : (
                <Menu className="h-8 w-8" strokeWidth={2} />
              )}
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute left-0 top-full z-100 ml-2 mt-2 w-[220px] rounded-xl border border-line-strong bg-surface/95 p-4 shadow-2xl backdrop-blur-xl"
              >
                {navLinks.map((item, index) => (
                  <a
                    key={item.key}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-lg font-bold tracking-tight transition-colors duration-200 ${
                      index === 0
                        ? "text-accent-ink"
                        : "text-ink hover:text-accent-ink"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.nav[item.key]}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="select-none font-mono text-2xl font-bold uppercase tracking-wider text-ink">
            PORTFOLIO<span className="text-accent-ink">.</span>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle />

            <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-ink-muted transition-colors duration-300 hover:text-accent-ink"
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            aria-pressed={isDark}
          >
            {isDark ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
            </button>
          </div>
        </nav>
      </header>

      <motion.div
        style={
          shouldReduceMotion
            ? undefined
            : {
                scale: layerScale,
                opacity: layerOpacity,
                willChange: "transform, opacity",
              }
        }
        className="flex h-full origin-top flex-col justify-between px-4 pb-4 pt-20 sm:pb-6 sm:pt-24"
      >

      {/* Nombre monumental con el retrato ovalado centrado entre lineas */}
      <div className="relative my-auto w-full text-center">
        <BlurText
          text={hero.firstName}
          animateBy="letters"
          delay={90}
          direction="top"
          className={nameClassName}
        />
        <BlurText
          text={hero.lastName}
          animateBy="letters"
          delay={90}
          direction="top"
          className={nameClassName}
        />

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[115px] w-[68px] overflow-hidden rounded-full border-2 border-accent bg-surface-2 shadow-2xl transition-transform duration-300 hover:scale-105 sm:h-[160px] sm:w-[95px] md:h-[195px] md:w-[115px] lg:h-[225px] lg:w-[135px]">
            <Image
              src={portrait.local}
              alt="Cristian Perez"
              fill
              priority
              sizes="(min-width: 1024px) 135px, (min-width: 768px) 115px, (min-width: 640px) 95px, 68px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Narrativa: entra escalonada al terminar el nombre */}
      <motion.div
        variants={copyContainerVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate="visible"
        className="z-20 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 text-center sm:gap-3"
      >
        <motion.div variants={copyItemVariants} className="w-full">
          <FadeSwap>
            <p className="text-base font-medium tracking-wide text-ink sm:text-lg md:text-xl">
              {t.hero.tagline}
            </p>
          </FadeSwap>
        </motion.div>

        <motion.div variants={copyItemVariants} className="w-full">
          <FadeSwap>
            <p className="mx-auto max-w-xl px-2 text-sm leading-relaxed text-ink-muted">
              {t.hero.description}
            </p>
          </FadeSwap>
        </motion.div>

        <motion.div variants={copyItemVariants} className="w-full">
          <FadeSwap>
            <p className="mx-auto max-w-xl px-2 text-xs leading-relaxed text-accent-ink sm:text-sm">
              {t.hero.philosophy}
            </p>
          </FadeSwap>
        </motion.div>

        <motion.div variants={copyItemVariants}>
          <FadeSwap className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-3 py-1 font-mono text-xs text-ink-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
              />
              {t.hero.badgeAvailability}
            </span>
            <span className="rounded-full border border-line-strong bg-surface-2 px-3 py-1 font-mono text-xs text-ink-muted">
              {t.hero.badgeLocation}
            </span>
          </FadeSwap>
        </motion.div>

        <motion.div
          variants={copyItemVariants}
          className="flex flex-col items-center gap-3 pt-2 sm:flex-row"
        >
          <FadeSwap>
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="accent-fill inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-bold tracking-wide shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {t.hero.ctaPrimary}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </FadeSwap>

          <FadeSwap>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:border-accent hover:text-accent-ink"
            >
              {t.hero.ctaSecondary}
            </a>
          </FadeSwap>
        </motion.div>

        {/* Oculto en pantallas cortas: a 360x640 empujaba el contenido
            43px por debajo del pliegue. */}
        <motion.a
          variants={copyItemVariants}
          href="#about"
          className="mt-2 hidden text-ink-subtle transition-colors duration-300 hover:text-accent-ink sm:inline-flex"
          aria-label={t.hero.scrollLabel}
        >
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </motion.a>
      </motion.div>
      </motion.div>
      </div>
    </div>
  );
}
