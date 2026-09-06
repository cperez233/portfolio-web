"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Menu, X, ChevronDown, ArrowUpRight, Moon, Sun } from "lucide-react";
import { hero, navLinks, portrait, site } from "@/data/site";

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

export default function PortfolioHero() {
  // El servidor ya pinta <html class="dark">, asi que `true` coincide con
  // la primera pintura: no hace falta leer el DOM ni hay parpadeo. Este
  // estado solo refleja el icono del boton; la verdad vive en <html>.
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    Color solido, no gradiente con background-clip:text. Cada letra de
    BlurText lleva un `filter` inline y un filter crea contexto de
    apilado: la letra se pinta aparte, hereda text-fill transparente y,
    sin fondo propio, desaparece. El acento solido da ademas 7.3:1 en
    oscuro y 9.8:1 en claro; el vino #652a31 sobre negro solo daria 1.8:1.
  */
  const nameClassName =
    "w-full flex-nowrap justify-center whitespace-nowrap text-accent-ink text-[11vw] font-black uppercase leading-[0.8] tracking-tighter select-none sm:text-[12vw] md:text-[13vw] lg:text-[14vw]";

  return (
    <div className="relative flex h-svh min-h-[600px] flex-col justify-between overflow-x-clip bg-canvas px-4 pb-4 pt-20 transition-colors duration-300 sm:pb-6 sm:pt-24">
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
                    key={item.label}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-lg font-bold tracking-tight transition-colors duration-200 ${
                      index === 0
                        ? "text-accent-ink"
                        : "text-ink hover:text-accent-ink"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="select-none font-mono text-2xl font-bold uppercase tracking-wider text-ink">
            PORTFOLIO<span className="text-accent-ink">.</span>
          </div>

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
        </nav>
      </header>

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

      {/* Narrativa y llamadas a la accion */}
      <div className="z-20 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 text-center sm:gap-3">
        <BlurText
          text={hero.tagline}
          animateBy="words"
          delay={90}
          direction="top"
          className="flex-wrap justify-center text-base font-medium tracking-wide text-ink sm:text-lg md:text-xl"
        />

        <p className="max-w-xl px-2 text-sm leading-relaxed text-ink-muted">
          {hero.description}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-3 py-1 font-mono text-xs text-ink-muted">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
            />
            {hero.badges.availability}
          </span>
          <span className="rounded-full border border-line-strong bg-surface-2 px-3 py-1 font-mono text-xs text-ink-muted">
            {hero.badges.location}
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 pt-2 sm:flex-row">
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="accent-fill inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-bold tracking-wide shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            Let&apos;s Talk on WhatsApp
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>

          <a
            href={hero.secondaryCta.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium tracking-wide text-ink transition-colors duration-300 hover:border-accent hover:text-accent-ink"
          >
            {hero.secondaryCta.label}
          </a>
        </div>

        {/* Oculto en pantallas cortas: a 360x640 empujaba el contenido
            43px por debajo del pliegue. Es solo una senal de scroll y el
            boton "Explore Projects & Work" ya cumple esa funcion. */}
        <a
          href="#about"
          className="mt-2 hidden text-ink-subtle transition-colors duration-300 hover:text-accent-ink sm:inline-flex"
          aria-label="Scroll to about"
        >
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </div>
    </div>
  );
}
