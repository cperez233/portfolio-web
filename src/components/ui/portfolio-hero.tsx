"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { Menu, X, ChevronDown, ArrowUpRight } from "lucide-react";

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

    return () => {
      observer.unobserve(element);
    };
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
  const [imageFailed, setImageFailed] = useState(false);
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
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const menuItems = [
    { label: "HOME", href: "#", highlight: true },
    { label: "ABOUT", href: "#about" },
    { label: "PROJECTS", href: "#projects" },
    { label: "EXPERIENCE", href: "#experience" },
    { label: "CONTACT", href: "#contact" },
  ];

  // next/font genera nombres de familia con hash: hay que referenciarlos
  // por su CSS variable, no por el nombre literal "Fira Code".
  const displayFont = "var(--font-fira-code), monospace";
  const taglineFont = "var(--font-antic), sans-serif";

  const nameClassName =
    "font-black text-[95px] sm:text-[145px] md:text-[185px] lg:text-[225px] leading-[0.75] tracking-tighter uppercase justify-center select-none";

  return (
    <div
      className="min-h-svh transition-colors overflow-x-clip relative flex flex-col justify-between"
      style={{
        backgroundColor: isDark ? "hsl(0 0% 0%)" : "hsl(0 0% 98%)",
        color: isDark ? "hsl(0 0% 100%)" : "hsl(0 0% 10%)",
      }}
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-6 backdrop-blur-md bg-transparent">
        <nav className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Menu Button */}
          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              className="p-2 transition-colors duration-300 z-50 text-neutral-400 hover:text-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X
                  className="w-8 h-8 transition-colors duration-300"
                  strokeWidth={2}
                />
              ) : (
                <Menu
                  className="w-8 h-8 transition-colors duration-300"
                  strokeWidth={2}
                />
              )}
            </button>

            {isMenuOpen && (
              <div
                ref={menuRef}
                className="absolute top-full left-0 w-[220px] border border-neutral-800 shadow-2xl mt-2 ml-2 p-4 rounded-xl z-[100] backdrop-blur-xl"
                style={{
                  backgroundColor: isDark
                    ? "rgba(10, 10, 10, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                }}
              >
                {menuItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block text-lg font-bold tracking-tight py-2 px-3 rounded-md transition-colors duration-200"
                    style={{
                      color: item.highlight
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

          {/* Logo Brand */}
          <div
            className="text-2xl font-bold tracking-wider uppercase select-none"
            style={{
              color: isDark ? "hsl(0 0% 100%)" : "hsl(0 0% 10%)",
              fontFamily: displayFont,
            }}
          >
            PORTFOLIO<span style={{ color: "#C3E41D" }}>.</span>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full border border-neutral-700/60 hover:opacity-80 transition-opacity"
            style={{
              backgroundColor: isDark ? "hsl(0 0% 12%)" : "hsl(0 0% 90%)",
            }}
            aria-label="Toggle theme"
            aria-pressed={isDark}
          >
            <div
              className="absolute top-0.5 left-1 w-5 h-5 rounded-full transition-transform duration-300"
              style={{
                backgroundColor: isDark ? "#C3E41D" : "hsl(0 0% 10%)",
                transform: isDark ? "translateX(1.6rem)" : "translateX(0)",
              }}
            />
          </button>
        </nav>
      </header>

      {/* Hero Main Content */}
      <section className="relative min-h-svh flex flex-col justify-center items-center pt-28 pb-12 px-4">
        {/* Name and Centered Oval Profile Picture */}
        <div className="relative text-center w-full max-w-6xl my-auto">
          <div>
            <BlurText
              text="ALEX"
              animateBy="letters"
              delay={90}
              direction="top"
              className={nameClassName}
              style={{ color: "#C3E41D", fontFamily: displayFont }}
            />
          </div>
          <div>
            <BlurText
              text="KANE"
              animateBy="letters"
              delay={90}
              direction="top"
              className={nameClassName}
              style={{ color: "#C3E41D", fontFamily: displayFont }}
            />
          </div>

          {/* Oval Photo Container */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative w-[68px] h-[115px] sm:w-[95px] sm:h-[160px] md:w-[115px] md:h-[195px] lg:w-[135px] lg:h-[225px] rounded-full overflow-hidden shadow-2xl border-2 border-[#C3E41D]/30 transition-transform duration-300 hover:scale-105 bg-neutral-900">
              {imageFailed ? (
                // Fallback local: sin peticiones externas, conserva el ovalo.
                <div
                  className="flex h-full w-full items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-900 text-sm font-bold tracking-widest"
                  style={{ color: "#C3E41D", fontFamily: displayFont }}
                  aria-hidden="true"
                >
                  AK
                </div>
              ) : (
                <Image
                  src="/perfil.png"
                  alt="Profile photo"
                  fill
                  priority
                  sizes="(min-width: 1024px) 135px, (min-width: 768px) 115px, (min-width: 640px) 95px, 68px"
                  className="object-cover"
                  onError={() => setImageFailed(true)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Narrative & Value Proposition */}
        <div className="w-full max-w-2xl text-center flex flex-col items-center gap-3 mt-4 z-20">
          <BlurText
            text="Designing human experiences in code."
            animateBy="words"
            delay={140}
            direction="top"
            className="text-lg sm:text-xl md:text-2xl font-medium tracking-wide text-neutral-400 justify-center"
            style={{ fontFamily: taglineFont }}
          />

          <p className="text-sm sm:text-base text-neutral-500 max-w-xl leading-relaxed px-4">
            Senior Creative Developer &amp; Web Architect specializing in
            scroll-driven interfaces, high-performance interactions, and modern
            web applications that elevate brand value.
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Available for Q2-Q3 Projects
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono border border-neutral-700/60 bg-neutral-800/40 text-neutral-400">
              Based in Remote / Worldwide
            </span>
          </div>

          {/* Interactive CTA */}
          <div className="pt-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
              style={{
                backgroundColor: "#C3E41D",
                color: "#000",
              }}
            >
              View Selected Works
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Bottom Scroll Indicator */}
        <a
          href="#projects"
          className="mt-8 transition-colors duration-300 text-neutral-500 hover:text-[#C3E41D]"
          aria-label="Scroll to projects"
        >
          <ChevronDown className="w-6 h-6 animate-bounce" />
        </a>
      </section>
    </div>
  );
}
