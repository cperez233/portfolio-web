"use client";

import { useState } from "react";
import Image from "next/image";
import { ContactButton } from "@/components/ui/ContactButton";
import { FadeIn } from "@/components/ui/FadeIn";
import { Magnet } from "@/components/ui/Magnet";
import { hero, navLinks, portrait, site } from "@/data/site";

/**
 * Hero hibrido: el retrato magnetico y el titular monumental del
 * portafolio 3D, con el badge de estado del hero interactivo previo.
 *
 * Cliente por el fallback de imagen y por el iman del retrato.
 */
export function HeroHybrid() {
  const [portraitSrc, setPortraitSrc] = useState<string>(portrait.local);

  return (
    <section className="relative flex h-svh min-h-[640px] flex-col overflow-x-clip px-5 py-6 sm:px-8">
      {/* Top navigation */}
      <header className="relative z-20 flex items-center justify-between gap-4">
        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-xs uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-60"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-white/10 px-3 text-[11px] uppercase tracking-wider text-[#D7E2EA] backdrop-blur-sm md:ml-auto">
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-emerald-400"
          />
          [ {hero.badge} ]
        </span>
      </header>

      {/* Titular monumental + retrato magnetico */}
      <div className="relative flex flex-1 items-center justify-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <FadeIn delay={0.15} y={40}>
            <h1 className="hero-heading text-center font-black uppercase leading-none tracking-tight text-[13vw] sm:text-[15vw] md:text-[16vw] lg:text-[17vw]">
              {hero.headingLines.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </FadeIn>
        </div>

        <div className="relative z-10">
          <Magnet padding={150} strength={3}>
            {/*
              La altura se acota contra el viewport: con `h-auto` el
              retrato salia a 782px y se comia el titular. object-top
              mantiene la cara encuadrada al recortar.
            */}
            <div className="relative h-[44svh] w-[280px] sm:h-[52svh] sm:w-[360px] md:h-[58svh] md:w-[440px] lg:h-[62svh] lg:w-[500px]">
              <Image
                src={portraitSrc}
                alt="Cristian Perez"
                fill
                priority
                sizes="(min-width: 1024px) 500px, (min-width: 768px) 440px, (min-width: 640px) 360px, 280px"
                className="object-cover object-top"
                onError={() => {
                  if (portraitSrc !== portrait.fallback) {
                    setPortraitSrc(portrait.fallback);
                  }
                }}
              />
            </div>
          </Magnet>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-[280px] text-xs font-light uppercase leading-relaxed tracking-wide text-[#D7E2EA]">
          {hero.statement}
        </p>

        <ContactButton href={site.whatsapp} external>
          Contact
        </ContactButton>
      </div>
    </section>
  );
}
