"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "framer-motion";
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
import { SPRITE_W } from "@/components/mini-stand/sprite";
import { HeroStand } from "./hero-stand";
import { playHeroCrack, shatterLetters, type HeroCrack, type Shattered } from "./hero-crack";
import { fist, impact, runPower, speedLines } from "@/components/mini-stand/powers";
import { layer as effectLayer, pop } from "@/components/mini-stand/power-kit";
import { playSfx } from "@/lib/sfx";

interface SlamTextProps {
  text: string;
  /** Cuando cae la primera letra, en ms desde el primer pintado. */
  start: number;
  /** Retardo entre letras, en ms. */
  step: number;
  className?: string;
}

/**
 * Nombre que cae letra a letra sobre la pagina, como el rotulo de una
 * portada de manga: cada letra baja grande, se aplasta al tocar y le
 * sale la sombra dura (.hero-slam en globals.css). Animacion CSS: arranca
 * en el primer pintado, sin esperar a React, y sin `filter` (el desenfoque
 * de antes repintaba cada letra en cada cuadro).
 */
function SlamText({ text, start, step, className = "" }: SlamTextProps) {
  // <span> y no <p>: el nombre va dentro de un <p> del hero, y un <p> no
  // puede ir dentro de otro.
  return (
    <span className={`inline-flex ${className}`}>
      {Array.from(text).map((letter, i) => (
        <span
          key={i}
          className="hero-slam"
          style={{ animationDelay: `${start + i * step}ms` }}
        >
          {letter}
        </span>
      ))}
    </span>
  );
}

/*
  Coreografia de la entrada, en ms desde el primer pintado. Todo es CSS
  (globals.css, "Entrada del hero") y cada pieza lee su retardo de aqui:

    0     las lineas de velocidad convergen hacia el retrato
    100   CRISTIAN cae letra a letra
    420   PEREZ cae, mas pesado
    840   el retrato se pega encima: golpe, temblor y ドン
    1150  el copy sube, una pieza cada 80ms
    1150  el Stand se levanta junto al retrato, enorme (0.4s), y SE QUEDA
          grande mientras hace una de dos cosas (ver pickIntro y DIAMOND /
          WORLD):
          · Crazy Diamond: ráfaga de punos ドラララ contra el nombre, un
            golpe final ドラァ! que agrieta la pantalla desde el impacto y
            despide las letras, un respiro con todo roto, y lo repara todo
            de vuelta hacia su puno
          · ZA WARUDO: grita ザ・ワールド, detiene el tiempo, y con todo
            quieto lanza cuchillos que se quedan colgados en el aire; al
            volver el tiempo se clavan en el nombre
          Al terminar se hace el mini Stand: viaja hasta donde el chico
          espera y se cambian sin que se note.
*/
const ENTRY = {
  firstName: 100,
  firstNameStep: 55,
  lastName: 420,
  lastNameStep: 70,
  portrait: 840,
  impact: 1080,
  stand: 1150,
  menacing: 1300,
  copy: 1150,
} as const;

/*
  Crazy Diamond, en el reloj de la animacion del Stand (que ya cuenta su
  retardo): la rafaga, el golpe final, la reparacion y el relevo.
*/
const DIAMOND = { rush: 1600, hits: 11, step: 62, finisher: 2380, heal: 3250, healMs: 700, condense: 4200 } as const;

/*
  ZA WARUDO, en el mismo reloj: el grito, el tiempo detenido (stop + ms),
  los cuchillos (uno cada knifeStep) y el relevo, que llega cuando los
  cuchillos ya se clavaron y se fue el 時は動き出す.
*/
const WORLD = { shout: 1580, stop: 1800, ms: 2300, knives: 2050, knifeStep: 110, condense: 5250 } as const;

/* El copy entra justo despues del golpe, cada pieza 80ms tras la anterior. */
function riseDelay(index: number): React.CSSProperties {
  return { animationDelay: `${ENTRY.copy + index * 80}ms` };
}

function delay(ms: number): React.CSSProperties {
  return { animationDelay: `${ms}ms` };
}

/*
  Que entrada toca. Se alternan: cada carga hace la otra que la anterior (se
  recuerda en este navegador), asi quien vuelve ve las dos. `?intro=world` o
  `?intro=diamond` fuerzan una, para verlas o probarlas.
*/
type Intro = "diamond" | "world";
const INTRO_KEY = "jojo-intro";

function pickIntro(): Intro {
  try {
    const forced = new URLSearchParams(window.location.search).get("intro");
    if (forced === "world" || forced === "diamond") return forced;
    const next: Intro = window.localStorage.getItem(INTRO_KEY) === "diamond" ? "world" : "diamond";
    window.localStorage.setItem(INTRO_KEY, next);
    return next;
  } catch {
    return "diamond";
  }
}

/**
 * Profundidad con el puntero: cada capa se desplaza segun su distancia,
 * las del fondo al reves que las de delante. Devuelve px.
 */
function useDepth(source: MotionValue<number>, depth: number) {
  return useTransform(source, (value) => value * depth);
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
  const standRef = useRef<HTMLDivElement>(null);
  const standCoreRef = useRef<HTMLDivElement>(null);
  // Que entrada toca: se decide una vez (y sobrevive al doble efecto de StrictMode).
  const introRef = useRef<Intro | null>(null);
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
    playSfx("warudo");
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
    Al irse, la viñeta se abre: CRISTIAN sale hacia un lado y PEREZ hacia
    el otro, y las lineas de velocidad giran.
    Valores cortos: el hero ya retrocede en escala, esto solo le da
    direccion.
  */
  const firstNameX = useTransform(scrollYProgress, [0, 1], ["0vw", "-7vw"]);
  const lastNameX = useTransform(scrollYProgress, [0, 1], ["0vw", "7vw"]);
  const linesTurn = useTransform(scrollYProgress, [0, 1], [0, 14]);

  /*
    Profundidad con el puntero, solo con raton (hover y puntero fino): en
    tactil no hay puntero que seguir y el hero se queda como esta. Un solo
    par de valores con muelle; cada capa lo multiplica por su distancia y
    escribe solo su propio transform (nada de variables CSS heredadas por
    cuadro). Con el tiempo detenido nadie se mueve.
  */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 90, damping: 18, mass: 0.7 });
  const smoothY = useSpring(pointerY, { stiffness: 90, damping: 18, mass: 0.7 });
  const linesX = useDepth(smoothX, -14);
  const linesY = useDepth(smoothY, -10);
  const nameX = useDepth(smoothX, 8);
  const nameY = useDepth(smoothY, 5);
  const portraitX = useDepth(smoothX, 16);
  const portraitY = useDepth(smoothY, 12);
  const portraitTiltX = useDepth(smoothY, -7);
  const portraitTiltY = useDepth(smoothX, 9);
  const menacingX = useDepth(smoothX, 34);
  const menacingY = useDepth(smoothY, 24);

  const [canTrack, setCanTrack] = useState(false);
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanTrack(fine.matches);
    update();
    fine.addEventListener("change", update);
    return () => fine.removeEventListener("change", update);
  }, []);
  const tracking = canTrack && !shouldReduceMotion;

  /*
    Relevo con el mini Stand: el grande se convierte en el chico. Mientras
    el grande se manifiesta, el chico (mini-stand.tsx) espera quieto y sin
    verse en su sitio, junto al retrato: la clase stand-manifest la pone
    StandManifestGate desde el primer pintado (ver ese componente: si la
    pusiera este efecto, el chico ya se habria dibujado y se veria como un
    fantasma que se apaga). Cuando el grande termina su poder viaja hasta
    ese mismo lugar, se encoge al tamano exacto del chico, y en ese momento
    uno desaparece y el otro aparece: es el mismo dibujo, el mismo sitio y
    el mismo tamano, asi que se lee como un solo personaje que se hace
    pequeno.

    Mientras esta grande hace una de dos (pickIntro), y no se encoge hasta
    terminarla:
    - Crazy Diamond: una rafaga de punos contra las letras del nombre (el
      Stand embiste hacia cada golpe), un golpe final que agrieta la
      pantalla desde el impacto y despide las letras (hero-crack.ts), y la
      reparacion: grietas y letras vuelven hacia su puno.
    - ZA WARUDO: detiene el tiempo de verdad (el poder del mini Stand, con
      su esfera). Solo el se mueve: lanza cuchillos que se quedan colgados
      en el aire, y al volver el tiempo se clavan en el nombre. El chico
      habla al final (mini-stand.tsx, "jojo:intro").

    El reloj es el de la propia animacion CSS del grande (no el de la
    pagina): si hidrata tarde, espera lo que falte; si ya paso el momento
    del poder, se lo salta y se hace chico enseguida; si ya paso todo,
    suelta al chico y esconde al grande. Con reduced motion el grande no
    sale.
  */
  useEffect(() => {
    const giant = standRef.current;
    const core = standCoreRef.current;
    const root = document.documentElement;
    // Sin relevo: el chico no se queda escondido ni un fotograma de mas.
    const skip = () => {
      root.classList.remove("stand-manifest");
      if (giant) giant.style.visibility = "hidden";
    };
    if (!giant || !core) return skip();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return skip();

    const run = giant.getAnimations().find((a) => (a as CSSAnimation).animationName === "hero-stand");
    const elapsed = Number(run?.currentTime ?? Infinity);
    const heroBox = heroRef.current?.getBoundingClientRect();
    // Ya paso el momento (hidrato muy tarde), o el hero no esta a la vista
    // (la pagina se abrio ya bajada): no hay relevo que ver.
    if (!run || run.playState === "finished" || elapsed > ENTRY.stand + 1500) return skip();
    if (heroBox && heroBox.bottom < window.innerHeight * 0.45) return skip();

    introRef.current ??= pickIntro();
    const intro = introRef.current;
    // El poder solo si no quedo atras (hidratacion tardia); sin el, el
    // grande se hace chico en cuanto termina de subir.
    const show = elapsed < (intro === "world" ? WORLD.shout : DIAMOND.rush) + 250;
    const condenseAt = show ? (intro === "world" ? WORLD.condense : DIAMOND.condense) : Math.max(elapsed, ENTRY.stand + 450);

    const timers: number[] = [];
    const animations: Animation[] = [];
    const layers: HTMLElement[] = [];
    let crack: HeroCrack | null = null;
    let shattered: Shattered | null = null;
    let worldOn = false;
    root.classList.add("stand-manifest");
    const stage = stickyRef.current?.firstElementChild as HTMLElement | null | undefined;
    const svg = core.querySelector("svg");
    const vw = window.innerWidth;
    const small = vw < 640;

    /** Programa `fn` en el reloj del Stand (sirve igual desde dentro de otro paso). */
    const born = performance.now() - elapsed;
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, Math.max(0, born + ms - performance.now())));
    const keep = (animation: Animation) => {
      animations.push(animation);
      return animation;
    };

    /** El pecho del Stand grande, en px de la ventana: de ahi nace todo. */
    const heart = () => {
      const from = svg?.getBoundingClientRect();
      return from?.width ? { x: from.left + from.width * 0.5, y: from.top + from.height * 0.55 } : null;
    };

    /*
      Las letras del nombre que se pueden golpear: las que se ven, sin las
      que tapan el retrato o el propio Stand (un golpe ahi no se veria). Si
      no queda ninguna, todas.
    */
    const targets = () => {
      const covers = [portraitRef.current?.getBoundingClientRect(), svg?.getBoundingClientRect()].filter(
        (box): box is DOMRect => !!box?.width,
      );
      const all = [...(stage?.querySelectorAll<HTMLElement>(".hero-slam") ?? [])]
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width && r.right > 0 && r.left < vw);
      const clear = all.filter(({ r }) => {
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        return !covers.some((box) => cx > box.left && cx < box.right && cy > box.top && cy < box.bottom);
      });
      return clear.length ? clear : all;
    };
    const pointIn = (r: DOMRect) => ({
      x: r.left + r.width * (0.25 + Math.random() * 0.5),
      y: r.top + r.height * (0.3 + Math.random() * 0.45),
    });

    /** El Stand embiste hacia (x, y) y vuelve: el golpe se ve salir de el. */
    const lunge = (x: number, y: number, reach: number, ms: number) => {
      const from = heart();
      if (!svg || !from) return;
      const dx = x - from.x;
      const dy = y - from.y;
      const d = Math.hypot(dx, dy) || 1;
      const px = Math.min(reach, d * 0.4);
      keep(
        svg.animate(
          [
            { translate: "0 0" },
            { translate: `${((dx / d) * px).toFixed(1)}px ${((dy / d) * px).toFixed(1)}px`, offset: 0.35 },
            { translate: "0 0" },
          ],
          { duration: ms, easing: "ease-out" },
        ),
      );
    };

    /** Una letra tiembla al recibir el golpe. */
    const jolt = (el: HTMLElement, px: number, ms: number) => {
      keep(
        el.animate(
          [
            { translate: "0 0" },
            { translate: `${px}px ${-px * 0.7}px` },
            { translate: `${-px}px ${px * 0.6}px` },
            { translate: "0 0" },
          ],
          { duration: ms, easing: "linear", composite: "add" },
        ),
      );
    };

    /** Sacude el hero entero. */
    const shake = (px: number, ms: number) => {
      if (!stage) return;
      keep(
        stage.animate(
          [
            { translate: "0 0" },
            { translate: `${-px}px ${px * 0.8}px` },
            { translate: `${px * 0.8}px ${-px * 0.7}px` },
            { translate: `${-px * 0.5}px ${px * 0.4}px` },
            { translate: "0 0" },
          ],
          { duration: ms, easing: "ease-out" },
        ),
      );
    };

    /*
      Onomatopeya grande junto al Stand, sin salirse de la pantalla: se
      centra en x, asi que se aparta del borde la mitad de lo que mide.
    */
    const shout = (text: string, x: number, y: number, className: string, life: number) => {
      const font = Math.min(88, Math.max(41.6, vw * 0.08));
      const half = Math.min(vw / 2, (text.length * font * 0.95) / 2);
      pop(text, Math.min(vw - half, Math.max(half, x)), Math.max(font + 70, y), className, life);
    };

    /** Capa fija para los efectos de la entrada; se quita al desmontar. */
    const fxLayer = () => {
      const node = effectLayer("power-sp", true);
      layers.push(node);
      return node;
    };

    /*
      Crazy Diamond: DORARARA. Cada golpe sale del Stand (embiste hacia el)
      y cae en una letra, que tiembla; el ultimo es el fuerte.
    */
    const manifestDiamond = () => {
      const list = targets();
      const from = heart();
      if (!list.length || !from || !stage) return;
      const fx = fxLayer();
      const center = list.reduce(
        (acc, { r }) => ({ x: acc.x + (r.left + r.width / 2) / list.length, y: acc.y + (r.top + r.height / 2) / list.length }),
        { x: 0, y: 0 },
      );
      const lines = speedLines(center.x, center.y);
      layers.push(lines);
      shout("ドラララ", from.x, from.y - (svg?.getBoundingClientRect().height ?? 200) * 0.3, "power-pop-word is-pink is-big", 1000);

      for (let i = 0; i < DIAMOND.hits; i++) {
        at(DIAMOND.rush + i * DIAMOND.step, () => {
          const origin = heart();
          const { el, r } = list[Math.floor(Math.random() * list.length)];
          const hit = pointIn(r);
          if (!origin) return;
          lunge(hit.x, hit.y, small ? 14 : 26, DIAMOND.step + 30);
          fist(fx, origin.x, origin.y, hit.x, hit.y, 0, 200).classList.add("is-diamond", ...(small ? [] : ["is-big"]));
          timers.push(
            window.setTimeout(() => {
              impact(hit.x, hit.y);
              jolt(el, small ? 3 : 5, 160);
              if (i % 3 === 1) pop("ドラ", hit.x, hit.y - r.height * 0.4, "power-pop-word is-pink", 650);
            }, 150),
          );
        });
      }

      // ドラァ!: el golpe final, en la letra mas cercana al Stand.
      at(DIAMOND.finisher, () => {
        const origin = heart();
        if (!origin) return;
        const near = [...list].sort(
          (p, q) =>
            Math.hypot(p.r.left + p.r.width / 2 - origin.x, p.r.top + p.r.height / 2 - origin.y) -
            Math.hypot(q.r.left + q.r.width / 2 - origin.x, q.r.top + q.r.height / 2 - origin.y),
        )[0];
        const hit = { x: near.r.left + near.r.width / 2, y: near.r.top + near.r.height / 2 };
        lunge(hit.x, hit.y, small ? 30 : 60, 260);
        const big = fist(fx, origin.x, origin.y, hit.x, hit.y, 0, 170);
        big.classList.add("is-diamond", small ? "is-big" : "is-huge");
        timers.push(
          window.setTimeout(() => {
            lines.classList.add("is-leaving");
            timers.push(window.setTimeout(() => lines.remove(), 450));
            impact(hit.x, hit.y, true);
            shout("ドラァ!", hit.x, hit.y - near.r.height * 0.7, "power-pop-word is-pink is-big", 1300);
            const letters = [...stage.querySelectorAll<HTMLElement>(".hero-slam")];
            crack = playHeroCrack(hit.x, hit.y, letters.map((el) => el.getBoundingClientRect()));
            shattered = shatterLetters(letters, hit);
            // Parada de impacto: un instante en que todo se queda quieto (menos el Stand).
            stage.classList.add("hero-hitstop");
            timers.push(window.setTimeout(() => stage.classList.remove("hero-hitstop"), 140));
            shake(small ? 6 : 10, 420);
          }, 130),
        );
      });

      // Crazy Diamond lo arregla: grietas y letras vuelven hacia su puno.
      at(DIAMOND.heal, () => {
        const origin = heart();
        if (!origin) return;
        pop("ドララ", origin.x, origin.y - (svg?.getBoundingClientRect().height ?? 200) * 0.45, "power-pop-word is-pink", 900);
        if (svg) {
          keep(
            svg.animate(
              [{ filter: "none" }, { filter: "drop-shadow(0 0 14px #e891c4)" }, { filter: "none" }],
              { duration: DIAMOND.healMs + 200, easing: "ease-in-out" },
            ),
          );
        }
        crack?.heal(origin.x, origin.y, DIAMOND.healMs);
        shattered?.mend(DIAMOND.healMs);
      });
    };

    /*
      ZA WARUDO: el grito, el tiempo detenido y los cuchillos. Con todo
      quieto solo el Stand se mueve: lanza y los cuchillos se quedan
      colgados donde el tiempo los paro; al volver, se clavan.
    */
    const manifestWorld = () => {
      const from = heart();
      if (!from) return;
      const tall = svg?.getBoundingClientRect().height ?? 200;
      shout("ザ・ワールド!", from.x, from.y - tall * 0.35, "power-pop-word is-gold is-big", 1300);
      keep(
        core.animate([{ scale: "1" }, { scale: "1.06" }, { scale: "1" }], { duration: 260, easing: "ease-out" }),
      );

      const knives: { node: HTMLElement; el: HTMLElement; hang: { x: number; y: number }; hit: { x: number; y: number } }[] = [];
      let fx: HTMLElement | null = null;

      at(WORLD.stop, () => {
        const at0 = heart();
        if (!at0) return;
        worldOn = true;
        window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "start" } }));
        // El rotulo (時よ止まれ / 時は動き出す) abajo: arriba taparia los cuchillos.
        root.classList.add("intro-banner-low");
        void runPower("zawarudo", { x: at0.x, y: at0.y, reducedMotion: false, pastScroll: 0, ms: WORLD.ms }).finally(() =>
          root.classList.remove("intro-banner-low"),
        );
        // El tiempo se detuvo para todos menos para el: sigue respirando.
        giant.getAnimations({ subtree: true }).forEach((a) => a.play());
        fx = fxLayer();
      });

      /*
        Cuchillos a letras distintas, repartidas por el nombre. Salen del
        Stand, giran en el aire para apuntar y el tiempo los deja colgados
        alrededor del nombre, cada uno hacia afuera de su letra: un anillo
        de cuchillos esperando a que el tiempo vuelva.
      */
      const list = targets().sort(() => Math.random() - 0.5);
      const count = Math.min(list.length, small ? 6 : 9);
      const name = list.reduce(
        (acc, { r }) => ({ x: acc.x + (r.left + r.width / 2) / list.length, y: acc.y + (r.top + r.height / 2) / list.length }),
        { x: 0, y: 0 },
      );
      for (let i = 0; i < count; i++) {
        at(WORLD.knives + i * WORLD.knifeStep, () => {
          const origin = heart();
          if (!origin || !fx) return;
          const { el, r } = list[i];
          const hit = pointIn(r);
          // Hacia afuera del nombre, torcido al azar, sin salirse de la pantalla.
          const out = Math.atan2(hit.y - name.y || -1, hit.x - name.x) + (Math.random() - 0.5) * 0.9;
          const gap = (small ? 50 : 85) + Math.random() * (small ? 25 : 45);
          const hx = Math.min(vw - 20, Math.max(20, hit.x + Math.cos(out) * gap));
          const hy = Math.max(70, hit.y + Math.sin(out) * gap);
          const hang = { x: hx - hit.x, y: hy - hit.y };
          const aim = Math.atan2(-hang.y, -hang.x);
          const flight = Math.atan2(hy - origin.y, hx - origin.x);
          lunge(hx, hy, small ? 12 : 22, 160);
          const knife = document.createElement("span");
          knife.className = small ? "stand-knife" : "stand-knife is-big";
          knife.style.animation = "none";
          knife.style.left = `${hit.x.toFixed(0)}px`;
          knife.style.top = `${hit.y.toFixed(0)}px`;
          knife.style.setProperty("--ka", `${aim.toFixed(3)}rad`);
          fx.appendChild(knife);
          keep(
            knife.animate(
              [
                { translate: `${(origin.x - hit.x).toFixed(1)}px ${(origin.y - hit.y).toFixed(1)}px`, rotate: `${flight.toFixed(3)}rad`, opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { translate: `${hang.x.toFixed(1)}px ${hang.y.toFixed(1)}px`, rotate: `${aim.toFixed(3)}rad`, opacity: 1 },
              ],
              { duration: 260, easing: "cubic-bezier(0.2, 0.9, 0.3, 1)", fill: "forwards" },
            ),
          );
          knives.push({ node: knife, el, hang, hit });
          if (i % 3 === 0) pop("無駄", origin.x + (Math.random() - 0.5) * 80, origin.y - tall * 0.35, "power-pop-word is-gold", 700);
        });
      }

      // そして時は動き出す: los cuchillos terminan su viaje de golpe.
      at(WORLD.stop + WORLD.ms + 40, () => {
        knives.forEach(({ node, el, hang, hit }, i) => {
          const fly = keep(
            node.animate(
              [{ translate: `${hang.x.toFixed(1)}px ${hang.y.toFixed(1)}px` }, { translate: "0px 0px" }],
              { duration: 110, delay: i * 30, easing: "cubic-bezier(0.6, 0, 0.9, 0.4)", fill: "forwards" },
            ),
          );
          fly.onfinish = () => {
            impact(hit.x, hit.y);
            jolt(el, small ? 3 : 5, 200);
          };
        });
        const list2 = knives.map(({ hit }) => hit);
        if (list2.length) {
          const top = Math.min(...list2.map((p) => p.y));
          const mid = list2.reduce((sum, p) => sum + p.x, 0) / list2.length;
          timers.push(
            window.setTimeout(() => {
              shout("ズドドドッ", mid, top - 30, "power-pop-word is-gold is-big", 1100);
              shake(small ? 5 : 8, 380);
            }, 120),
          );
        }
        // Se quedan clavados un momento y se desvanecen.
        timers.push(
          window.setTimeout(() => {
            knives.forEach(({ node }) => keep(node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 350, fill: "forwards" })));
          }, 1500),
        );
      });
    };

    /*
      Corte limpio, sin fundido: los dos son el mismo dibujo en el mismo
      sitio y tamano, y un fundido dejaria a los dos a media opacidad uno
      sobre otro (el nombre se transparentaria detras). Se quita la
      transicion de la capa del chico solo este fotograma.
    */
    const finish = () => {
      const layerEl = document.querySelector<HTMLElement>(".stand-layer");
      if (layerEl) layerEl.style.transition = "none";
      root.classList.remove("stand-manifest");
      giant.style.visibility = "hidden";
      requestAnimationFrame(() => requestAnimationFrame(() => layerEl && (layerEl.style.transition = "")));
      // Las capas de efectos, cuando ya se desvanecio lo que llevan.
      timers.push(window.setTimeout(() => layers.forEach((node) => node.remove()), 1500));
      // ZA WARUDO: el chico remata (mini-stand.tsx).
      if (worldOn) {
        worldOn = false;
        window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "end" } }));
      }
    };

    const condense = () => {
      const mini = document.querySelector<HTMLElement>(".stand-hit");
      const from = svg?.getBoundingClientRect();
      const to = mini?.getBoundingClientRect();
      if (!from?.width || !to?.width) {
        crack?.cancel();
        shattered?.cancel();
        return finish();
      }
      // La rejilla del chico (SPRITE_W celdas) y la del grande (una celda
      // de margen en total): misma celda, otro tamano.
      const miniCell = to.width / SPRITE_W;
      const bigCell = from.width / (SPRITE_W + 1);
      const dx = to.left - miniCell / 2 - from.left;
      const dy = to.top - miniCell / 2 - from.top;
      // Si llega tarde, el viaje es mas corto: el grande ya se esta yendo.
      const duration = elapsed > condenseAt + 150 ? 280 : 380;
      const move = keep(
        core.animate(
          [
            { transform: "translate(0, 0) scale(1)" },
            { transform: `translate(${dx}px, ${dy}px) scale(${miniCell / bigCell})` },
          ],
          { duration, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "forwards" },
        ),
      );
      move.onfinish = () => {
        finish();
        // Las letras ya estan en su sitio: se suelta lo que las sujeta.
        timers.push(window.setTimeout(() => shattered?.cancel(), 700));
      };
      // Si el poder no llego a repararlas (hidratacion tardia), se reparan aqui.
      crack?.heal(to.left + to.width / 2, to.top + to.height / 2, duration);
      shattered?.mend(duration + 120);
      // El contorno de tinta crece hasta el grosor del chico (ver hero-stand.tsx).
      const rim = core.querySelector(".hero-stand-rim");
      const rimPx = Math.max(1, Math.round(miniCell / 2));
      if (rim) {
        keep(
          rim.animate([{ strokeWidth: "0.6" }, { strokeWidth: String((rimPx * 2) / miniCell) }], {
            duration,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            fill: "forwards",
          }),
        );
      }
    };

    if (show) at(intro === "world" ? WORLD.shout : DIAMOND.rush, intro === "world" ? manifestWorld : manifestDiamond);
    at(condenseAt, condense);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      animations.forEach((a) => a.cancel());
      layers.forEach((node) => node.remove());
      crack?.cancel();
      shattered?.cancel();
      stage?.classList.remove("hero-hitstop");
      root.classList.remove("intro-banner-low");
      if (worldOn) window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "cancel" } }));
      root.classList.remove("stand-manifest");
    };
  }, []);

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!tracking || event.pointerType !== "mouse") return;
    if (document.documentElement.classList.contains("time-stopped")) return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width - 0.5) * 2);
    pointerY.set(((event.clientY - box.top) / box.height - 0.5) * 2);
  }

  function onPointerLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  /** Estilo de una capa: nada con reduced motion o sin puntero fino. */
  function layer(style: MotionStyle): MotionStyle | undefined {
    return shouldReduceMotion ? undefined : style;
  }

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
  /*
    Estilo JoJo: Anton (mas estrecha que la Geist Black, de ahi el vw un
    poco mayor) y los dos colores de la portada del README: nombre en
    crema/tinta, apellido en oro.
  */
  const nameBaseClassName =
    "w-full flex-nowrap justify-center whitespace-nowrap font-display transition-colors duration-500 text-[22vw] uppercase leading-[0.84] tracking-[0.01em] select-none sm:text-[18.5vw] md:text-[17vw] lg:text-[15.5vw]";
  const firstNameClassName = `${nameBaseClassName} hero-name-first text-ink`;
  const nameClassName = `${nameBaseClassName} hero-name-last text-name`;

  return (
    <div ref={heroRef} data-stand-hero className="relative z-0 h-svh min-h-[600px]">
      <div
        ref={stickyRef}
        data-time-stopped={timeStop ? "true" : undefined}
        onPointerMove={tracking ? onPointerMove : undefined}
        onPointerLeave={tracking ? onPointerLeave : undefined}
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
          Fondo de vineta de impacto, en capas de profundidad: lineas de
          velocidad y trama de puntos detras de todo y el ゴゴゴ delante. Todo decorativo, sin eventos. Cada
          capa tiene dos envoltorios: el de fuera se mueve con el puntero
          o el scroll (transform de Framer Motion) y el de dentro hace la
          entrada CSS, para que los dos transform no se pisen.
        */}
        <motion.div
          aria-hidden="true"
          style={layer({ x: linesX, y: linesY, rotate: linesTurn })}
          className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[150vw] -translate-x-1/2 -translate-y-1/2 sm:size-[110vw] lg:size-[80vw]"
        >
          <div className="speed-lines hero-lines-in size-full" />
        </motion.div>
        <div
          aria-hidden="true"
          className="halftone halftone-fade hero-tone-in pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[90vw] -translate-x-1/2 -translate-y-1/2 lg:size-[52vw]"
        />

        <motion.div
          style={layer({ x: menacingX, y: menacingY })}
          className="pointer-events-none absolute inset-0 z-20"
        >
          <div className="hero-pop absolute -top-[9%] left-[3%] hidden sm:block" style={delay(ENTRY.menacing)}>
            <Menacing size="clamp(1.6rem, 4vw, 3.6rem)" />
          </div>
          <div
            className="hero-pop absolute -top-[62%] right-[4%] sm:-bottom-[12%] sm:top-auto sm:right-[3%]"
            style={delay(ENTRY.menacing + 120)}
          >
            <Menacing size="clamp(1.4rem, 3.4vw, 3rem)" />
          </div>
        </motion.div>

        {/*
          El nombre es la marca, no el <h1>: el h1 es la frase de abajo,
          que dice que se vende (Google y las IAs le dan mas peso a esa
          linea; el nombre ya va en el title). Las letras van en spans
          sueltos y algun lector de pantalla las deletrearia, de ahi el
          aria-hidden y el nombre entero en sr-only. El espacio entre las
          dos lineas es para quien lee el texto plano.

          El temblor de impacto (.hero-impact) va en el <p> y el puntero en
          su envoltorio: dos transform distintos en dos elementos.
        */}
        <motion.div style={layer({ x: nameX, y: nameY })}>
          <p className="hero-impact" style={delay(ENTRY.impact)}>
            <span className="sr-only">{site.name}</span>
            <span aria-hidden="true">
              <motion.span style={layer({ x: firstNameX })} className="block">
                <SlamText
                  text={hero.firstName}
                  start={ENTRY.firstName}
                  step={ENTRY.firstNameStep}
                  className={firstNameClassName}
                />
              </motion.span>{" "}
              <motion.span style={layer({ x: lastNameX })} className="block">
                <SlamText
                  text={hero.lastName}
                  start={ENTRY.lastName}
                  step={ENTRY.lastNameStep}
                  className={nameClassName}
                />
              </motion.span>
            </span>
          </p>
        </motion.div>

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
          dice que hace el boton. Se pega encima del nombre con un golpe
          (.hero-paste) y con raton se inclina hacia el puntero.
        */}
        <motion.div
          style={layer({
            x: portraitX,
            y: portraitY,
            rotateX: portraitTiltX,
            rotateY: portraitTiltY,
            transformPerspective: 800,
          })}
          className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
        >
          <div className="hero-paste" style={delay(ENTRY.portrait)}>
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
          {/*
            El Stand se manifiesta al lado de su usuario, enorme y en trama,
            se sostiene con el ゴゴゴ y se hace el mini Stand (ver el efecto
            del relevo). Va dentro del envoltorio del retrato y DELANTE de
            la foto, igual que el mini Stand (que vive por encima de todo):
            si estuviera detras, al cambiarse saltaria al frente. Por eso
            se para junto a la foto y no sobre ella. Una sola vez; con
            reduced motion no sale.
          */}
          <div ref={standRef} aria-hidden="true" className="hero-stand pointer-events-none" style={delay(ENTRY.stand)}>
            <div ref={standCoreRef} className="hero-stand-core">
              <HeroStand />
            </div>
          </div>

          {/*
            ドン: el golpe del retrato al pegarse. Sale una vez, se sostiene
            y se va; no es otro adorno fijo. Con reduced motion no existe.
          */}
          <span aria-hidden="true" className="hero-don" style={delay(ENTRY.impact - 40)}>
            ドン
          </span>
        </motion.div>
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
