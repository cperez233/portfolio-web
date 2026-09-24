"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowUpRight, Download, Mail } from "lucide-react";
import { hero, portrait, site } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { FadeSwap } from "./FadeSwap";
import { GithubMark } from "./github-mark";

interface BlurTextProps {
  text: string;
  /** Retardo entre letras, en ms. */
  delay?: number;
  className?: string;
}

/**
 * Nombre revelado letra a letra con la animacion CSS .hero-letter (ver
 * globals.css): arranca en el primer pintado, sin esperar a React.
 */
function BlurText({ text, delay = 50, className = "" }: BlurTextProps) {
  // <span> y no <p>: el nombre va dentro del <h1> del hero, y un <p> no
  // puede ir dentro de un encabezado.
  return (
    <span className={`inline-flex ${className}`}>
      {text.split("").map((letter, i) => (
        <span
          key={i}
          className="hero-letter"
          style={{ animationDelay: `${i * delay}ms` }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

/*
  El nombre se revela letra a letra: "CRISTIAN" son 8 letras a 90ms de
  retardo mas 500ms de animacion, asi que termina cerca de 1.13s. El
  copy arranca en 1.0s, cada pieza 80ms despues de la anterior, para
  encadenar sin dejar un hueco muerto.
*/
function riseDelay(index: number): React.CSSProperties {
  return { animationDelay: `${1000 + index * 80}ms` };
}

const linkPillClass =
  "inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-surface-2/60 px-4 text-sm text-ink-muted transition-colors duration-300 hover:border-accent hover:text-accent-ink";

interface PortfolioHeroProps {
  /** Ruta del CV, o null si el PDF no esta en /public (ver page.tsx). */
  cvHref: string | null;
}

export default function PortfolioHero({ cvHref }: PortfolioHeroProps) {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

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

  /*
    Escala del nombre. Medido sobre la Geist Black con `tracking-tighter`,
    "CRISTIAN" ocupa 4.57 veces el tamano de fuente, asi que el ancho que
    llena es font-size x 4.57 y sale igual en cualquier pantalla.

    De ahi la escalera invertida. En un movil de 390px, 11vw dejaba el
    nombre en 196px: la mitad justa de la pantalla, y con el hueco
    vertical del hero se leia pequeno en lugar de monumental. A 19vw
    ocupa el 87% del ancho y vuelve a mandar en la composicion. En
    pantallas anchas el 64% de 14vw si es la proporcion buscada: llenar
    el ancho ahi daria un nombre de 180px de alto.

    El contenedor va a ancho completo a proposito: un `max-w` fijo era lo
    que partia "CRISTIAN" en "CRISTI / AN" en pantallas anchas.

    Color solido (token --color-name), no gradiente. Dos razones: cada
    letra de BlurText lleva un `filter` inline, y un filter crea contexto
    de apilado que rompe background-clip:text; y los gradientes no
    interpolan, asi que el nombre saltaria de golpe al cambiar de tema
    mientras el resto funde en 500ms.
  */
  const nameClassName =
    "w-full flex-nowrap justify-center whitespace-nowrap text-name transition-colors duration-500 text-[19vw] font-black uppercase leading-[0.8] tracking-tighter select-none sm:text-[16vw] md:text-[15vw] lg:text-[14vw]";

  return (
    <div ref={heroRef} className="relative z-0 h-svh min-h-[600px]">
      <div className="sticky top-0 h-svh min-h-[600px] overflow-x-clip bg-canvas transition-colors duration-500">
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
        {/*
          El nombre es el <h1> de la pagina: sin el, el HTML no tenia
          ningun encabezado principal. aria-label porque las letras van en
          spans sueltos y algun lector de pantalla las deletrearia; el
          espacio entre las dos lineas es para quien lee el texto plano
          (buscadores), que si no veria "CRISTIANPEREZ".
        */}
        <h1 aria-label={site.name}>
          <BlurText
            text={hero.firstName}
              delay={90}
              className={nameClassName}
          />{" "}
          <BlurText
            text={hero.lastName}
              delay={90}
              className={nameClassName}
          />
        </h1>

        {/*
          z-10 a proposito: el retrato es un medallon incrustado sobre el
          nombre, no un accidente de apilado. Por debajo de 640px el
          tamano base tiene que encajar en el hueco entre las dos lineas
          en vez de heredar el de sm: a 19vw con leading-0.8, dos lineas
          miden font-size*1.6 de alto (97px a 320px, 130px a 428px); un
          ovalo de 150px (el tamano de sm/md/lg) se sale de ese hueco y
          tapa el interior de "CRISTIAN"/"PEREZ" en cualquier telefono
          real. 100px si cabe con margen en todo el rango 320-490px.
        */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[100px] w-[60px] overflow-hidden rounded-full border-2 border-accent bg-surface-2 shadow-2xl transition-transform duration-300 hover:scale-105 sm:h-[170px] sm:w-[100px] md:h-[195px] md:w-[115px] lg:h-[225px] lg:w-[135px]">
            <Image
              src={portrait.local}
              alt={site.name}
              fill
              priority
              sizes="(min-width: 1024px) 135px, (min-width: 768px) 115px, (min-width: 640px) 100px, 89px"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Narrativa: entra escalonada al terminar el nombre */}
      <div
        className="z-20 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 text-center sm:gap-3"
      >
        <div className="hero-rise w-full" style={riseDelay(0)}>
          <FadeSwap>
            <p className="text-xl font-medium tracking-tight text-ink sm:text-2xl md:text-3xl">
              {t.hero.tagline}
            </p>
          </FadeSwap>
        </div>

        <div className="hero-rise w-full" style={riseDelay(1)}>
          <FadeSwap>
            <p className="mx-auto max-w-xl px-2 text-base leading-relaxed text-ink-muted sm:text-lg">
              {t.hero.description}
            </p>
          </FadeSwap>
        </div>

        <div className="hero-rise" style={riseDelay(2)}>
          {/*
            FadeSwap envuelve `children` en su propio div de crossfade
            (`col-start-1 row-start-1`, sin flex): el `flex gap-*` tiene
            que ir en ESTE div de adentro, no en el className de
            FadeSwap, o el espacio entre placas no aplica.
          */}
          <FadeSwap className="pt-1">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* Sin punto verde que late: la frase ya dice que esta
                  disponible, y el indicador "en vivo" es de los tics mas
                  gastados de las plantillas. */}
              <span className="rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 font-mono text-sm text-ink-muted">
                {t.hero.badgeAvailability}
              </span>
              <span className="rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 font-mono text-sm text-ink-muted">
                {t.hero.badgeLocation}
              </span>
            </div>
          </FadeSwap>
        </div>

        <div className="hero-rise flex flex-col items-center gap-3 pt-2 sm:flex-row" style={riseDelay(3)}>
          <FadeSwap>
            <a
              href={buildWhatsappUrl(t.whatsappMessage)}
              onClick={() => trackWhatsappClick("hero", language)}
              target="_blank"
              rel="noopener noreferrer"
              className="accent-fill inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-bold tracking-wide shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {t.hero.ctaPrimary}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </FadeSwap>

          <FadeSwap>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-7 text-base font-medium tracking-wide text-ink transition-colors duration-300 hover:border-accent hover:text-accent-ink"
            >
              {t.hero.ctaSecondary}
            </a>
          </FadeSwap>
        </div>

        {/*
          Enlaces directos para quien evalua el perfil: codigo, CV y
          correo, sin pasar por WhatsApp. Pildoras y no botones completos:
          una tercera fila de botones de 48px empujaba el hero por debajo
          del pliegue en un movil.
        */}
        <div className="hero-rise" style={riseDelay(4)}>
          <FadeSwap>
            <ul className="flex flex-wrap items-center justify-center gap-2">
              <li>
                <a
                  href={site.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkPillClass}
                >
                  <GithubMark className="size-4" />
                  {t.hero.links.github}
                </a>
              </li>
              {cvHref ? (
                <li>
                  <a href={cvHref} download className={linkPillClass}>
                    <Download className="size-4" aria-hidden="true" />
                    {t.hero.links.cv}
                  </a>
                </li>
              ) : null}
              <li>
                <a href={site.emailHref} className={linkPillClass}>
                  <Mail className="size-4" aria-hidden="true" />
                  {t.hero.links.email}
                </a>
              </li>
            </ul>
          </FadeSwap>
        </div>

        {/* Oculto en pantallas cortas: a 360x640 empujaba el contenido
            43px por debajo del pliegue. */}
        <a
          href="#about"
          style={riseDelay(5)}
          className="hero-rise mt-2 hidden text-ink-subtle transition-colors duration-300 hover:text-accent-ink sm:inline-flex"
          aria-label={t.hero.scrollLabel}
        >
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </div>
      </motion.div>
      </div>
    </div>
  );
}
