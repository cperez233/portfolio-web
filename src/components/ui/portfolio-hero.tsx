"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { ChevronDown, ArrowUpRight, Download, Mail } from "lucide-react";
import { hero, portrait, site } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { FadeSwap } from "./FadeSwap";
import { GithubMark } from "./github-mark";
import { Magnetic } from "@/components/ui/magnetic";
import { Menacing } from "@/components/ui/menacing";
import { stopTime as freezeTime } from "@/lib/time-stop";
import { emitStandEvent } from "@/lib/stand-events";
import { unlockSecret } from "@/lib/secrets";

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
  // <span> y no <p>: el nombre va dentro de un <p> del hero, y un <p> no
  // puede ir dentro de otro.
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
  "hit-area-y inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-surface-2/60 px-4 text-sm text-ink-muted transition-colors duration-300 hover:border-accent hover:text-accent-ink";

interface PortfolioHeroProps {
  /** Ruta del CV, o null si el PDF no esta en /public (ver page.tsx). */
  cvHref: string | null;
}

export default function PortfolioHero({ cvHref }: PortfolioHeroProps) {
  const { t, language } = useLanguage();
  const heroRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  /*
    ZA WARUDO: el tiempo se detiene durante unos segundos. Se guarda el
    centro del retrato relativo al hero pegado, porque el retrato se mueve
    con la escala del scroll y la esfera tiene que nacer de el. Con
    reduced motion no se dispara: es un efecto que es todo movimiento.
  */
  const [timeStop, setTimeStop] = useState<{ id: number; x: number; y: number } | null>(null);

  function stopTime() {
    if (shouldReduceMotion) return;
    const portraitEl = portraitRef.current;
    const stickyEl = stickyRef.current;
    if (!portraitEl || !stickyEl) return;

    emitStandEvent("timestop");
    unlockSecret("timestop");
    // De verdad: nadie se mueve (salvo el Stand) mientras dura la esfera.
    void freezeTime(3200);
    const portraitBox = portraitEl.getBoundingClientRect();
    const stickyBox = stickyEl.getBoundingClientRect();
    setTimeStop({
      id: Date.now(),
      x: portraitBox.left + portraitBox.width / 2 - stickyBox.left,
      y: portraitBox.top + portraitBox.height / 2 - stickyBox.top,
    });
  }

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
  /*
    Estilo JoJo: Anton (mas estrecha que la Geist Black, de ahi el vw un
    poco mayor) y los dos colores de la portada del README: nombre en
    crema/tinta, apellido en oro.
  */
  const nameBaseClassName =
    "w-full flex-nowrap justify-center whitespace-nowrap font-display transition-colors duration-500 text-[22vw] uppercase leading-[0.84] tracking-[0.01em] select-none sm:text-[18.5vw] md:text-[17vw] lg:text-[15.5vw]";
  const firstNameClassName = `${nameBaseClassName} text-ink`;
  const nameClassName = `${nameBaseClassName} text-name`;

  return (
    <div ref={heroRef} data-stand-hero className="relative z-0 h-svh min-h-[600px]">
      <div
        ref={stickyRef}
        data-time-stopped={timeStop ? "true" : undefined}
        className="sticky top-0 h-svh min-h-[600px] overflow-x-clip bg-canvas transition-colors duration-500"
      >
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

      {/* Nombre monumental con el retrato en vineta centrado entre lineas */}
      <div className="relative my-auto w-full text-center">
        {/*
          Fondo de vineta de impacto: lineas de velocidad y trama de puntos
          detras del retrato, y el ゴゴゴ a los lados. Todo decorativo y
          detras del nombre (-z-10), sin eventos.
        */}
        <div
          aria-hidden="true"
          className="speed-lines pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[150vw] -translate-x-1/2 -translate-y-1/2 sm:size-[110vw] lg:size-[80vw]"
        />
        <div
          aria-hidden="true"
          className="halftone halftone-fade pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[90vw] -translate-x-1/2 -translate-y-1/2 lg:size-[52vw]"
        />
        <Menacing
          size="clamp(1.6rem, 4vw, 3.6rem)"
          className="absolute -top-[9%] left-[3%] z-20 hidden sm:block"
        />
        <Menacing
          size="clamp(1.4rem, 3.4vw, 3rem)"
          className="absolute -top-[62%] right-[4%] z-20 sm:-bottom-[12%] sm:top-auto sm:right-[3%]"
        />
        {/*
          El nombre es la marca, no el <h1>: el h1 es la frase de abajo,
          que dice que se vende (Google y las IAs le dan mas peso a esa
          linea; el nombre ya va en el title). Las letras van en spans
          sueltos y algun lector de pantalla las deletrearia, de ahi el
          aria-hidden y el nombre entero en sr-only. El espacio entre las
          dos lineas es para quien lee el texto plano.
        */}
        <p>
          <span className="sr-only">{site.name}</span>
          <span aria-hidden="true">
            <BlurText
              text={hero.firstName}
              delay={90}
              className={firstNameClassName}
            />{" "}
            <BlurText
              text={hero.lastName}
              delay={90}
              className={nameClassName}
            />
          </span>
        </p>

        {/*
          z-10 a proposito: el retrato es un medallon incrustado sobre el
          nombre, no un accidente de apilado. Por debajo de 640px el
          tamano base tiene que encajar en el hueco entre las dos lineas
          en vez de heredar el de sm: a 19vw con leading-0.8, dos lineas
          miden font-size*1.6 de alto (97px a 320px, 130px a 428px); un
          ovalo de 150px (el tamano de sm/md/lg) se sale de ese hueco y
          tapa el interior de "CRISTIAN"/"PEREZ" en cualquier telefono
          real. 100px si cabia; ahora todos los tamanos van un 14% mas
          chicos para que el medallon tape menos el nombre.
        */}
        {/*
          El retrato es tambien el boton de ZA WARUDO: al tocarlo el tiempo
          se detiene (ver stopTime). aria-label porque la imagen sola no
          dice que hace el boton.
        */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <button
            ref={portraitRef}
            data-stand-home
            type="button"
            onClick={stopTime}
            aria-label={t.jojo.timeStop}
            title={t.jojo.timeStop}
            className="relative block cursor-pointer transition-transform duration-300 hover:scale-105"
          >
            <span className="manga-portrait relative block h-[86px] w-[60px] overflow-hidden bg-surface-2 sm:h-[146px] sm:w-[100px] md:h-[168px] md:w-[116px] lg:h-[194px] lg:w-[134px]">
              <Image
                src={portrait.local}
                alt={site.name}
                fill
                priority
                sizes="(min-width: 1024px) 134px, (min-width: 768px) 116px, (min-width: 640px) 100px, 60px"
                className="object-cover"
              />
            </span>
            {/*
              Sello que avisa que el retrato se toca (el easter egg no se
              descubria solo). Fuera del recorte del retrato para que
              sobresalga de la esquina. aria-hidden: el boton ya tiene
              su aria-label.
            */}
            <span aria-hidden="true" className="time-stamp">
              <span className="time-stamp-kanji">時</span>
              <span className="time-stamp-hint">{t.jojo.timeStopHint}</span>
            </span>
          </button>
        </div>
      </div>

      {/* Narrativa: entra escalonada al terminar el nombre */}
      <div
        className="z-20 mx-auto flex w-full max-w-2xl flex-col items-center gap-2 text-center sm:gap-3"
      >
        <div className="hero-rise w-full" style={riseDelay(0)}>
          <FadeSwap>
            {/* El h1 de la pagina: la oferta. Sin Anton ni mayusculas
                (los h1 las heredan de globals.css): se ve igual que antes. */}
            <h1 className="font-sans text-xl font-medium normal-case tracking-tight text-ink [font-synthesis:weight] sm:text-2xl md:text-3xl">
              {t.hero.tagline}
            </h1>
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
              <span className="rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 text-sm text-ink-muted">
                {t.hero.badgeAvailability}
              </span>
              <span className="rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 text-sm text-ink-muted">
                {t.hero.badgeLocation}
              </span>
            </div>
          </FadeSwap>
        </div>

        <div className="hero-rise flex flex-col items-center gap-3 pt-2 sm:flex-row" style={riseDelay(3)}>
          <FadeSwap>
            <Magnetic>
            <a
              href={buildWhatsappUrl(t.whatsappMessage)}
              onClick={() => trackWhatsappClick("hero", language)}
              target="_blank"
              rel="noopener noreferrer"
              className="accent-fill group inline-flex min-h-12 items-center gap-2 rounded-full px-7 text-base font-bold tracking-wide transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              {t.hero.ctaPrimary}
              <ArrowUpRight
                className="h-4 w-4 transition-transform duration-300 ease-[var(--ease-premium)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            </Magnetic>
          </FadeSwap>

          <FadeSwap>
            <Magnetic strength={0.2}>
            <a
              href={hero.secondaryCtaHref}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line-strong px-7 text-base font-medium tracking-wide text-ink transition-colors duration-300 hover:border-accent hover:text-accent-ink"
            >
              {t.hero.ctaSecondary}
            </a>
            </Magnetic>
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
          className="hero-rise mt-1 hidden size-11 items-center justify-center text-ink-subtle transition-colors duration-300 hover:text-accent-ink sm:inline-flex"
          aria-label={t.hero.scrollLabel}
        >
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </a>
      </div>
      </motion.div>

      {/*
        ZA WARUDO. Una esfera blanca con mix-blend-mode: difference crece
        desde el retrato e invierte todo el hero, como el reloj de la
        portada del README. Va FUERA del motion.div para no heredar su
        escala, y dentro del sticky (que ya es contexto de apilado), asi
        que solo invierte el hero. Sin z-index a proposito: un z-index
        crearia su propio contexto y la esfera se mezclaria con nada (se
        veria blanca). Al ir despues en el DOM ya pinta encima. La key
        reinicia la animacion en cada toque. Decorativo: aria-hidden.
      */}
      {timeStop ? (
        <div
          key={timeStop.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
          onAnimationEnd={(event) => {
            if (event.animationName === "za-warudo") setTimeStop(null);
          }}
        >
          <span
            className="za-warudo-sphere"
            style={{ left: timeStop.x, top: timeStop.y }}
          />
          <span className="za-warudo-text">時よ止まれ！</span>
        </div>
      ) : null}
      </div>
    </div>
  );
}
