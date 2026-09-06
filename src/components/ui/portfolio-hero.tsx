"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";
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
    // Se captura el nodo: en la limpieza `ref.current` ya puede ser null.
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);
    return () => observer.unobserve(element);
  }, []);

  const segments = useMemo(() => {
    return animateBy === "words" ? text.split(" ") : text.split("");
  }, [text, animateBy]);

  return (
    <p ref={ref} className={`inline-flex flex-wrap ${className}`} style={style}>
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
  const [isDark, setIsDark] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

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

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  const displayFont = "var(--font-fira-code), monospace";

  /*
    17vw sostiene la linea mas larga: "CRISTIAN" son 8 caracteres y
    Fira Code avanza 0.6em por caracter, asi que ocupa 8 x 0.6 x 17vw
    = 81.6vw. Con 4 caracteres se podia subir mucho mas; con 8 no.
  */
  const nameClassName =
    "font-black text-[17vw] leading-[0.8] tracking-tighter uppercase justify-center select-none";

  return (
    <div
      className="relative flex min-h-svh flex-col justify-between overflow-x-clip transition-colors"
      style={{
        backgroundColor: isDark ? "#09090b" : "hsl(0 0% 98%)",
        color: isDark ? "hsl(0 0% 100%)" : "hsl(0 0% 10%)",
      }}
    >
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 bg-transparent px-6 py-6 backdrop-blur-md">
        <nav className="mx-auto flex max-w-screen-2xl items-center justify-between">
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              className="z-50 p-2 text-neutral-400 transition-colors duration-300 hover:text-white"
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
                className="absolute left-0 top-full z-100 mt-2 ml-2 w-[220px] rounded-xl border border-neutral-800 p-4 shadow-2xl backdrop-blur-xl"
                style={{
                  backgroundColor: isDark
                    ? "rgba(10, 10, 10, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                }}
              >
                {navLinks.map((item, index) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-lg font-bold tracking-tight transition-colors duration-200"
                    style={{
                      color:
                        index === 0
                          ? "#C3E41D"
                          : isDark
                            ? "hsl(0 0% 100%)"
                            : "hsl(0 0% 10%)",
                    }}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div
            className="select-none text-2xl font-bold uppercase tracking-wider"
            style={{
              color: isDark ? "hsl(0 0% 100%)" : "hsl(0 0% 10%)",
              fontFamily: displayFont,
            }}
          >
            PORTFOLIO<span style={{ color: "#C3E41D" }}>.</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="relative h-7 w-14 rounded-full border border-neutral-700/60 transition-opacity hover:opacity-80"
            style={{ backgroundColor: isDark ? "hsl(0 0% 12%)" : "hsl(0 0% 90%)" }}
            aria-label="Toggle theme"
            aria-pressed={isDark}
          >
            <div
              className="absolute left-1 top-0.5 h-5 w-5 rounded-full transition-transform duration-300"
              style={{
                backgroundColor: isDark ? "#C3E41D" : "hsl(0 0% 10%)",
                transform: isDark ? "translateX(1.6rem)" : "translateX(0)",
              }}
            />
          </button>
        </nav>
      </header>

      <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pb-12 pt-28">
        {/* Nombre monumental con el retrato ovalado centrado */}
        <div className="relative my-auto w-full max-w-6xl text-center">
          <BlurText
            text={hero.firstName}
            animateBy="letters"
            delay={90}
            direction="top"
            className={nameClassName}
            style={{ color: "#C3E41D", fontFamily: displayFont }}
          />
          <BlurText
            text={hero.lastName}
            animateBy="letters"
            delay={90}
            direction="top"
            className={nameClassName}
            style={{ color: "#C3E41D", fontFamily: displayFont }}
          />

          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="relative h-[115px] w-[68px] overflow-hidden rounded-full border-2 border-[#C3E41D]/30 bg-neutral-900 shadow-2xl transition-transform duration-300 hover:scale-105 sm:h-[160px] sm:w-[95px] md:h-[195px] md:w-[115px] lg:h-[225px] lg:w-[135px]">
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
        <div className="z-20 mt-4 flex w-full max-w-2xl flex-col items-center gap-3 text-center">
          <BlurText
            text={hero.tagline}
            animateBy="words"
            delay={90}
            direction="top"
            className="justify-center text-lg font-medium tracking-wide text-neutral-300 sm:text-xl md:text-2xl"
          />

          <p className="max-w-xl px-4 text-sm leading-relaxed text-neutral-500 sm:text-base">
            {hero.description}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs text-emerald-400">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"
              />
              {hero.badges.availability}
            </span>
            <span className="rounded-full border border-neutral-700/60 bg-neutral-800/40 px-3 py-1 font-mono text-xs text-neutral-400">
              {hero.badges.location}
            </span>
          </div>

          <div className="flex flex-col items-center gap-3 pt-3 sm:flex-row">
            <a
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-bold tracking-wide shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
              style={{ backgroundColor: "#C3E41D", color: "#09090b" }}
            >
              Let&apos;s Talk on WhatsApp
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>

            <a
              href={hero.secondaryCta.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-neutral-700 px-6 text-sm font-medium tracking-wide text-neutral-300 transition-colors duration-300 hover:border-neutral-500 hover:text-white"
            >
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>

        <a
          href="#projects"
          className="mt-8 text-neutral-500 transition-colors duration-300 hover:text-[#C3E41D]"
          aria-label="Scroll to projects"
        >
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </section>
    </div>
  );
}
