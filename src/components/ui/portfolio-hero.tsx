"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import { hero, portrait } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl } from "@/lib/contact";
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
              alt="Cristian Perez"
              fill
              priority
              sizes="(min-width: 1024px) 135px, (min-width: 768px) 115px, (min-width: 640px) 100px, 89px"
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
            <p className="text-xl font-medium tracking-tight text-ink sm:text-2xl md:text-3xl">
              {t.hero.tagline}
            </p>
          </FadeSwap>
        </motion.div>

        <motion.div variants={copyItemVariants} className="w-full">
          <FadeSwap>
            <p className="mx-auto max-w-xl px-2 text-base leading-relaxed text-ink-muted sm:text-lg">
              {t.hero.description}
            </p>
          </FadeSwap>
        </motion.div>

        <motion.div variants={copyItemVariants}>
          {/*
            FadeSwap envuelve `children` en su propio div de crossfade
            (`col-start-1 row-start-1`, sin flex): el `flex gap-*` tiene
            que ir en ESTE div de adentro, no en el className de
            FadeSwap, o el espacio entre placas no aplica.
          */}
          <FadeSwap className="pt-1">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 font-mono text-sm text-ink-muted">
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"
                />
                {t.hero.badgeAvailability}
              </span>
              <span className="rounded-full border border-line-strong bg-surface-2 px-3.5 py-1.5 font-mono text-sm text-ink-muted">
                {t.hero.badgeLocation}
              </span>
            </div>
          </FadeSwap>
        </motion.div>

        <motion.div
          variants={copyItemVariants}
          className="flex flex-col items-center gap-3 pt-2 sm:flex-row"
        >
          <FadeSwap>
            <a
              href={buildWhatsappUrl(t.whatsappMessage)}
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
