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
import { endTimeStop, stopTime as freezeTime, isTimeStopped, type TimeStopDetail } from "@/lib/time-stop";
import { emitStandEvent } from "@/lib/stand-events";
import { unlockSecret } from "@/lib/secrets";
import { POSES, SPRITE_W, type Body, type Face, type Frame } from "@/components/mini-stand/sprite";
import { standLines } from "@/components/mini-stand/lines";
import { pickLine } from "@/components/mini-stand/pick";
import { FRONT_FIST_SVG, HeroStand, showHeroFrame } from "./hero-stand";
import { createGlass, shatterLetters, type HeroGlass, type Shattered } from "./hero-crack";
import { finishEntrance, INTROS, nextIntro, type IntroId, type IntroKit } from "./hero-intros";
import { impact, runPower, speedLines } from "@/components/mini-stand/powers";
import { layer as effectLayer, pop, rand } from "@/components/mini-stand/power-kit";
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
          grande mientras hace su entrada: una por visita, al azar y sin
          repetir hasta que salgan todas (hero-intros/bag.ts). Dos viven
          aqui (DIAMOND / WORLD); las otras siete, cada una en su archivo
          de hero-intros/ (King Crimson, Bites the Dust, Gold Experience,
          Sticky Fingers, Echoes ACT 3, To Be Continued y Heaven's Door):
          · Crazy Diamond: rompe la cuarta pared. Le pega a la pantalla
            misma con una rafaga ドラララ: cada puno sale de el, crece hacia
            quien mira y choca contra el vidrio, que se agrieta donde pega.
            El golpe final ドラァ! parte la pantalla entera, despide las
            letras y suelta trozos de vidrio. El Stand se da cuenta de lo
            que hizo, se disculpa y lo repara todo hacia su puno.
          · ZA WARUDO: grita ザ・ワールド y detiene el tiempo. Mientras
            esta detenido no se ve nada: el tambien queda quieto. Al
            volver el tiempo ya esta del otro lado del retrato, posando
            (cada vez una pose distinta), y se burla de que usó el poder
            para eso.
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
  retardo): se prepara, la rafaga contra la pantalla (un puno cada step),
  el golpe final, el "uy", la reparacion, el "listo" y el relevo.
*/
const DIAMOND = {
  windup: 1580,
  rush: 1760,
  hits: 14,
  step: 92,
  finisher: 3280,
  oops: 4000,
  heal: 4900,
  healMs: 900,
  fixed: 5900,
  condense: 6900,
} as const;

/*
  ZA WARUDO, en el mismo reloj: el grito y el tiempo detenido (stop + ms),
  en el que no pasa nada que se vea. Lo demas no va por reloj sino desde
  el instante en que el tiempo vuelve (el evento de lib/time-stop.ts): en
  un equipo lento el time stop arranca tarde, y con horas fijas el Stand
  se movia con el tiempo aun detenido. Desde ese instante: ya esta en otro
  sitio posando, la broma en dos tiempos (joke y punchline, ya con risa)
  y el relevo (condense). condense en el reloj es solo el respaldo.
*/
const WORLD = { shout: 1560, stop: 1860, ms: 2800, joke: 460, punchline: 1810, condense: 8000, after: 3310 } as const;

/* Inclinacion de cada pose JoJo, en grados: torcidas, como en el manga. */
const POSE_TILT: Partial<Record<Body, number>> = { pose: -13, arms: 6, point: 11, wide: -9, high: 14 };

/* El copy entra justo despues del golpe, cada pieza 80ms tras la anterior. */
function riseDelay(index: number): React.CSSProperties {
  return { animationDelay: `${ENTRY.copy + index * 80}ms` };
}

function delay(ms: number): React.CSSProperties {
  return { animationDelay: `${ms}ms` };
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
  const introRef = useRef<ReturnType<typeof nextIntro> | null>(null);
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

  // Las frases del Stand grande, en el idioma de la carga (el efecto corre una vez).
  const languageRef = useRef(language);
  const jojoRef = useRef(t.jojo);

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

    Mientras esta grande hace su entrada (nextIntro), y no se encoge hasta
    terminarla. Las siete de hero-intros/ reciben un IntroKit (el reloj,
    el dibujo, el globo, las capas y el relevo) y se describen en su
    archivo. Las dos de aqui:
    - Crazy Diamond: le pega a la pantalla. Cada puno sale de su pecho y
      crece hacia quien mira hasta chocar con el vidrio (createGlass, en
      hero-crack.ts), que se agrieta donde pega; el Stand alterna los
      punos, se le ven brazos de mas por la velocidad y embiste en cada
      golpe. El final parte la pantalla, despide las letras y suelta
      vidrio. Se disculpa en un globo y repara todo hacia su puno.
    - ZA WARUDO: detiene el tiempo de verdad (el poder del mini Stand, con
      su esfera). Mientras dura no se ve nada: el queda quieto con todo lo
      demas. Al volver el tiempo aparece del otro lado del retrato en una
      pose JoJo, cuenta su chiste y se rie. Desde ahi viaja al chico, que
      remata al final (mini-stand.tsx, "jojo:intro").

    El reloj es el de la propia animacion CSS del grande (no el de la
    pagina): si hidrata tarde, espera lo que falte; si ya paso el momento
    del poder, se lo salta y se hace chico enseguida; si ya paso todo,
    suelta al chico y esconde al grande. Con reduced motion el grande no
    sale (y la bolsa de entradas no se toca).

    Mientras dura hay un boton "Saltar intro" (y Esc): corta todo, deja
    la entrada CSS en su ultimo cuadro, reanuda el tiempo si estaba
    detenido y el chico aparece ya en su sitio, con una frase.
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

    introRef.current ??= nextIntro();
    const choice = introRef.current;
    const intro: IntroId = choice.id;
    const def = intro === "world" || intro === "diamond" ? null : INTROS[intro];
    const lines = standLines[languageRef.current].intro;
    const startAt = def ? def.start : intro === "world" ? WORLD.shout : DIAMOND.windup;
    // El poder solo si no quedo atras (hidratacion tardia); sin el, el
    // grande se hace chico en cuanto termina de subir.
    const show = elapsed < startAt + 250;
    const condenseAt = show ? (def ? def.condense : intro === "world" ? WORLD.condense : DIAMOND.condense) : Math.max(elapsed, ENTRY.stand + 450);
    // Solo sale de la bolsa si de verdad se ve.
    if (show) choice.commit();

    const timers: number[] = [];
    const animations: Animation[] = [];
    const layers: HTMLElement[] = [];
    let glass: HeroGlass | null = null;
    let shattered: Shattered | null = null;
    // Avisaron al chico que empezo una entrada (para avisarle si se corta a medias).
    let introOn = false;
    root.classList.add("stand-manifest");
    const stage = stickyRef.current?.firstElementChild as HTMLElement | null | undefined;
    if (!stage) return skip();
    const svg = core.querySelector("svg");
    // Envoltorio del dibujo: embiste, se estira y se inclina sin tocar el
    // transform del nucleo (el del viaje al mini Stand) ni el del SVG (el espejo).
    const body = core.querySelector<HTMLElement>(".hero-stand-body");
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const small = vw < 640;

    /** Programa `fn` en el reloj del Stand (sirve igual desde dentro de otro paso). */
    const born = performance.now() - elapsed;
    const at = (ms: number, fn: () => void) =>
      timers.push(window.setTimeout(fn, Math.max(0, born + ms - performance.now())));
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const keep = (animation: Animation) => {
      animations.push(animation);
      return animation;
    };

    /** Cambia el cuadro del Stand grande: pose (cuerpo) y gesto (cara). */
    const frame = (name: Frame, extra?: { body?: Body; face?: Face }) => {
      if (svg) showHeroFrame(svg, name, extra);
    };

    /** El pecho del Stand grande, en px de la ventana: de ahi nace todo. */
    const heart = () => {
      const from = svg?.getBoundingClientRect();
      return from?.width ? { x: from.left + from.width * 0.5, y: from.top + from.height * 0.62 } : null;
    };

    /*
      La mano de una pose, en px de la ventana: el puno del brazo estirado
      (point) o el puno en alto (high). Celdas del dibujo de 20 x 23 (con
      el margen); espejado mira al retrato, y la mano cambia de lado.
    */
    const hand = (pose: "point" | "high") => {
      const r = svg?.getBoundingClientRect();
      if (!svg || !r?.width) return null;
      const mirrored = getComputedStyle(svg).scale.trim().startsWith("-");
      const cell = pose === "point" ? { x: 19, y: 15.5 } : { x: 16, y: 3 };
      const fx = cell.x / 20;
      return { x: r.left + r.width * (mirrored ? 1 - fx : fx), y: r.top + r.height * (cell.y / 23) };
    };

    /** Las letras del nombre que se ven. */
    const letterEls = () =>
      [...(stage?.querySelectorAll<HTMLElement>(".hero-slam") ?? [])].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width && r.right > 0 && r.left < vw;
      });

    /** El Stand se echa hacia quien mira (crece un poco) y vuelve: el golpe sale de el. */
    const lunge = (amount: number, ms: number) => {
      if (!body) return;
      keep(
        body.animate([{ scale: "1" }, { scale: String(1 + amount), offset: 0.3 }, { scale: "1" }], {
          duration: ms,
          easing: "ease-out",
        }),
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
      La pantalla cede con el golpe: todo lo de detras se hunde un poco
      desde el punto del impacto, como un vidrio que se flexiona.
    */
    const dent = (x: number, y: number, depth: number, ms: number) => {
      if (!stage) return;
      const box = stage.getBoundingClientRect();
      stage.style.transformOrigin = `${(x - box.left).toFixed(0)}px ${(y - box.top).toFixed(0)}px`;
      keep(
        stage.animate([{ scale: "1" }, { scale: String(1 - depth), offset: 0.25 }, { scale: "1" }], {
          duration: ms,
          easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
        }),
      ).onfinish = () => (stage.style.transformOrigin = "");
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
      El globo del Stand grande: el mismo del mini Stand, sobre su cabeza (o
      a un lado si arriba esta la barra), escrito letra a letra. Con el
      tiempo detenido tambien escribe: el globo es suyo y el se sigue
      riendo por dentro.
    */
    let bubble: HTMLParagraphElement | null = null;
    let typing = 0;
    let hideAt = 0;
    const talk = (text: string, ms: number) => {
      const head = svg?.getBoundingClientRect();
      if (!text || !head?.width) return;
      if (!bubble) {
        bubble = document.createElement("p");
        bubble.className = "stand-speech hero-say";
        fxLayer().appendChild(bubble);
      }
      const node = bubble;
      window.clearInterval(typing);
      window.clearTimeout(hideAt);
      node.style.width = "";
      node.textContent = text;
      if (/[!！]$/.test(text) && text === text.toUpperCase()) node.setAttribute("data-tone", "shout");
      else node.removeAttribute("data-tone");
      node.setAttribute("data-on", "");
      const bw = node.offsetWidth;
      const bh = node.offsetHeight;
      node.style.width = `${bw}px`;
      const cx = head.left + head.width * 0.5;
      let x = Math.min(Math.max(12, cx - bw / 2), vw - bw - 12);
      let y = head.top - bh - 12;
      node.removeAttribute("data-side");
      if (y < 68) {
        y = head.top + head.height * 0.06;
        const right = head.right + 8;
        const side = right + bw < vw - 12 ? "right" : "left";
        node.setAttribute("data-side", side);
        x = side === "right" ? right : Math.max(12, head.left - bw - 8);
      }
      node.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
      node.style.setProperty("--tail-x", `${Math.round(cx - x)}px`);
      let shown = 1;
      node.textContent = text.slice(0, 1);
      typing = window.setInterval(() => {
        shown += 1;
        node.textContent = text.slice(0, shown);
        if (shown >= text.length) window.clearInterval(typing);
      }, 24);
      timers.push(typing);
      hideAt = window.setTimeout(() => node.removeAttribute("data-on"), ms + text.length * 24);
      timers.push(hideAt);
    };
    const hush = () => {
      window.clearInterval(typing);
      bubble?.removeAttribute("data-on");
    };

    /*
      Un puno de la rafaga rompe la cuarta pared: sale del pecho del Stand
      del tamano de su puno y crece, acelerando, hasta el tamano que tendria
      pegado al vidrio en (x, y). Ahi se aplasta un instante contra la
      pantalla, que se agrieta y se hunde, y se recoge hacia el Stand.
    */
    const throwFist = (fx: HTMLElement, x: number, y: number, size: number, travel: number, onHit: () => void) => {
      const from = heart();
      if (!from) return;
      const el = document.createElement("span");
      el.className = "hero-fist";
      el.style.left = `${x.toFixed(0)}px`;
      el.style.top = `${y.toFixed(0)}px`;
      el.style.width = `${size.toFixed(0)}px`;
      el.innerHTML = FRONT_FIST_SVG;
      fx.appendChild(el);
      const start = Math.max(0.06, ((svg?.getBoundingClientRect().width ?? 200) * 0.28) / size);
      const dx = from.x - x;
      const dy = from.y - y;
      const tilt = rand(-18, 18);
      const go = keep(
        el.animate(
          [
            { transform: `translate(${dx.toFixed(0)}px, ${dy.toFixed(0)}px) scale(${start.toFixed(3)}) rotate(${(tilt * 2).toFixed(0)}deg)`, opacity: 0.85 },
            { transform: `translate(0px, 0px) scale(1) rotate(${tilt.toFixed(0)}deg)`, opacity: 1 },
          ],
          { duration: travel, easing: "cubic-bezier(0.55, 0, 0.95, 0.45)", fill: "forwards" },
        ),
      );
      go.onfinish = () => {
        onHit();
        // Pegado al vidrio: se aplasta, y se va de vuelta al Stand.
        const back = keep(
          el.animate(
            [
              { transform: `translate(0px, 0px) scale(1.06, 0.94) rotate(${tilt.toFixed(0)}deg)`, opacity: 1 },
              { transform: `translate(0px, 0px) scale(1) rotate(${tilt.toFixed(0)}deg)`, opacity: 1, offset: 0.35 },
              { transform: `translate(${(dx * 0.6).toFixed(0)}px, ${(dy * 0.6).toFixed(0)}px) scale(${(start * 1.6).toFixed(3)}) rotate(${(tilt * 2).toFixed(0)}deg)`, opacity: 0 },
            ],
            { duration: 230, easing: "cubic-bezier(0.3, 0, 0.7, 1)", fill: "forwards" },
          ),
        );
        back.onfinish = () => el.remove();
      };
    };

    /*
      Donde pegan los punos: toda la pantalla es el blanco. Una rejilla
      barajada (sin dos golpes seguidos en la misma zona), con un punto al
      azar dentro de cada celda y la parte de arriba libre de la barra.
    */
    const hitPoints = (count: number) => {
      const cols = small ? 2 : 4;
      const rowsN = small ? 4 : 3;
      const top = 90;
      const cellW = vw / cols;
      const cellH = (vh - top - 40) / rowsN;
      const cells: { x: number; y: number }[] = [];
      for (let r = 0; r < rowsN; r++) for (let c = 0; c < cols; c++) cells.push({ x: c, y: r });
      const out: { x: number; y: number }[] = [];
      let last: { x: number; y: number } | null = null;
      while (out.length < count) {
        const deck = [...cells].sort(() => Math.random() - 0.5);
        // En la costura entre dos barajas, nunca la misma celda dos veces seguidas:
        // el golpe caia sobre su propia grieta y parecia que no rompia nada.
        if (last && deck[0] === last) deck.push(deck.shift()!);
        for (const cell of deck) {
          last = cell;
          if (out.length >= count) break;
          out.push({
            x: (cell.x + rand(0.2, 0.8)) * cellW,
            y: top + (cell.y + rand(0.2, 0.8)) * cellH,
          });
        }
      }
      return out;
    };

    /*
      Brazos de mas: en la rafaga el Stand golpea tan rapido que se le ven
      varios punos a la vez alrededor del pecho, parpadeando.
    */
    const rushArms = (on: boolean) => {
      if (!body) return;
      let arms = body.querySelector<HTMLElement>(".hero-rush");
      if (on && !arms) {
        arms = document.createElement("div");
        arms.className = "hero-rush";
        arms.setAttribute("aria-hidden", "true");
        const spots = [
          [8, 44, 0.9],
          [58, 40, 1.05],
          [22, 60, 1.2],
          [66, 58, 0.85],
          [2, 54, 0.75],
          [44, 70, 1],
          [34, 46, 1.3],
        ];
        arms.innerHTML = spots
          .map(
            ([x, y, s], i) =>
              `<span style="left:${x}%;top:${y}%;--s:${s};animation-delay:${i * 23}ms">${FRONT_FIST_SVG}</span>`,
          )
          .join("");
        body.appendChild(arms);
      }
      arms?.classList.toggle("is-on", on);
    };

    /*
      Crazy Diamond: DORARARA contra la pantalla. El Stand se prepara con
      la cara de enojo, y cada golpe alterna puno (jab / jabL), embiste y
      manda un puno hacia el vidrio. El ultimo, enorme, al centro.
    */
    const manifestDiamond = () => {
      const from = heart();
      if (!from || !stage) return;
      const tall = svg?.getBoundingClientRect().height ?? 200;
      window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "start", kind: "diamond" } }));
      frame("stand", { face: "angry" });
      lunge(0.05, 260);
      // A un lado del Stand y no encima: que se le vea la cara de enojo.
      shout("ドラララ", from.x - tall * 0.75, from.y - tall * 0.3, "power-pop-word is-pink is-big", 1100);
      glass = createGlass();
      const fx = fxLayer();
      const points = hitPoints(small ? 10 : DIAMOND.hits);
      const hits = points.length;
      const fistSize = small ? Math.min(vw * 0.36, 170) : Math.min(Math.min(vw, vh) * 0.3, 300);

      at(DIAMOND.rush - 60, () => {
        rushArms(true);
        layers.push(speedLines(vw / 2, vh / 2));
      });
      for (let i = 0; i < hits; i++) {
        at(DIAMOND.rush + i * DIAMOND.step, () => {
          frame(i % 2 ? "jabL" : "jab");
          lunge(small ? 0.035 : 0.05, DIAMOND.step + 20);
          const point = points[i];
          const size = fistSize * rand(0.8, 1.15);
          throwFist(fx, point.x, point.y, size, 150, () => {
            glass?.hit(point.x, point.y, size * rand(0.42, 0.6));
            impact(point.x, point.y);
            dent(point.x, point.y, 0.006, 160);
            // La letra que quede bajo el golpe tiembla.
            const near = letterEls().find((el) => {
              const r = el.getBoundingClientRect();
              return Math.abs(r.left + r.width / 2 - point.x) < r.width && Math.abs(r.top + r.height / 2 - point.y) < r.height;
            });
            if (near) jolt(near, small ? 3 : 5, 180);
            if (i % 4 === 1) pop("ドラ", point.x + rand(-40, 40), point.y - size * 0.45, "power-pop-word is-pink", 650);
          });
        });
      }

      // ドラァ!: se echa atras para tomar impulso y pega en el centro de la pantalla.
      at(DIAMOND.finisher - 160, () => {
        rushArms(false);
        frame("stand", { body: "pose", face: "angry" });
        if (body) keep(body.animate([{ scale: "1" }, { scale: "0.94" }], { duration: 150, easing: "ease-out", fill: "forwards" }));
      });
      at(DIAMOND.finisher, () => {
        frame("jab");
        lunge(small ? 0.08 : 0.12, 420);
        const x = vw / 2 + rand(-vw * 0.06, vw * 0.06);
        const y = vh * 0.5 + rand(-vh * 0.04, vh * 0.04);
        const size = small ? vw * 0.82 : Math.min(vw * 0.6, vh * 0.78);
        throwFist(fx, x, y, size, 210, () => {
          const letters = letterEls();
          glass?.shatter(x, y, letters.map((el) => el.getBoundingClientRect()));
          shattered = shatterLetters(letters, { x, y });
          impact(x, y, true);
          shout("ドラァ!", x, y - size * 0.42, "power-pop-word is-pink is-big", 1400);
          // Las lineas de la rafaga se apagan con el ultimo golpe: relajado ya no titilan.
          const speed = layers.filter((node) => node.classList.contains("power-speedlines"));
          speed.forEach((node) => node.classList.add("is-leaving"));
          later(650, () => speed.forEach((node) => node.remove()));
          // Destello blanco del vidrio al romperse.
          const flash = fxLayer();
          flash.classList.add("hero-flash");
          // Parada de impacto: un instante en que todo se queda quieto (menos el Stand).
          stage.classList.add("hero-hitstop");
          later(150, () => stage.classList.remove("hero-hitstop"));
          dent(x, y, 0.03, 520);
          shake(small ? 7 : 12, 480);
        });
      });

      // Se da cuenta de lo que hizo.
      at(DIAMOND.oops, () => {
        frame("stand", { face: "shock" });
        talk(pickLine(lines.oops), 900);
      });
      at(DIAMOND.oops + 650, () => frame("sweat"));

      // Crazy Diamond lo arregla: vidrio, grietas y letras vuelven hacia su puno.
      at(DIAMOND.heal, () => {
        const origin = heart();
        if (!origin) return;
        hush();
        frame("stand", { body: "high", face: "happy" });
        pop("ドララ", origin.x, origin.y - tall * 0.62, "power-pop-word is-pink", 900);
        if (svg) {
          keep(
            svg.animate(
              [{ filter: "none" }, { filter: "drop-shadow(0 0 16px #e891c4)" }, { filter: "none" }],
              { duration: DIAMOND.healMs + 200, easing: "ease-in-out" },
            ),
          );
        }
        glass?.heal(origin.x, origin.y - tall * 0.35, DIAMOND.healMs);
        shattered?.mend(DIAMOND.healMs);
      });
      at(DIAMOND.fixed, () => {
        frame("stand", { face: "wink" });
        talk(pickLine(lines.fixed), 700);
      });
    };

    /*
      ZA WARUDO como se ve desde afuera en la serie: grita ザ・ワールド, el
      tiempo se detiene y no pasa nada que se vea (el tambien queda quieto,
      ni respira: su animacion se pausa con las demas). Cuando el tiempo
      vuelve ya esta del otro lado del retrato, mirandolo, en una pose JoJo
      (una al azar, torcida como en una viñeta), y donde estaba queda su
      silueta un instante. Despues cuenta su broma en dos tiempos sobre
      parar el tiempo para posar, y se rie.
    */
    let moved = false;
    /*
      Del otro lado del retrato si cabe (en celular puede quedar un poco
      fuera del borde); si no, mas arriba del mismo lado. Mirando al
      retrato, en una pose JoJo torcida como en una viñeta.
    */
    const jumpAside = (pose: Body, face: Face) => {
      const before = svg?.getBoundingClientRect();
      const photo = portraitRef.current?.getBoundingClientRect();
      if (!svg || !before?.width || !photo) return;
      moved = true;
      if (photo.left - before.width > -before.width * 0.12) {
        giant.style.left = "auto";
        giant.style.right = small ? "calc(100% + 0.25rem)" : "calc(100% - 0.5rem)";
        // Mira hacia el retrato, que ahora le queda a la derecha.
        svg.style.scale = "1 1";
      } else giant.style.bottom = "10%";
      frame("stand", { body: pose, face });
      if (body) {
        body.style.rotate = `${POSE_TILT[pose] ?? 0}deg`;
        body.style.scale = "1.06";
      }
    };
    let resumed = false;
    let onResume: (event: Event) => void = () => {};
    const manifestWorld = () => {
      const from = heart();
      if (!from) return relay();
      const tall = svg?.getBoundingClientRect().height ?? 200;
      frame("stand", { face: "smug" });
      // Sobre el nombre y no sobre el Stand.
      shout("ザ・ワールド!", vw / 2, from.y + tall * 0.2, "power-pop-word is-gold is-big", 1300);
      lunge(0.06, 200);

      const pose = POSES[Math.floor(Math.random() * POSES.length)];
      const jokes = lines.jokes;
      const setup = pickLine(jokes.map(([first]) => first));
      const punch = jokes.find(([first]) => first === setup)?.[1] ?? "";

      at(WORLD.stop, () => {
        const at0 = heart();
        if (!at0) return;
        introOn = true;
        window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "start", kind: "world" } }));
        // El rotulo (時よ止まれ / 時は動き出す) abajo: arriba taparia al Stand.
        root.classList.add("intro-banner-low");
        void runPower("zawarudo", { x: at0.x, y: at0.y, reducedMotion: false, pastScroll: 0, ms: WORLD.ms }).finally(() =>
          root.classList.remove("intro-banner-low"),
        );
      });

      // そして時は動き出す: ya no esta donde estaba. Justo al volver el tiempo, ni antes ni despues.
      const appear = () => {
        const before = svg?.getBoundingClientRect();
        const photo = portraitRef.current?.getBoundingClientRect();
        if (!svg || !before?.width || !photo) return;
        // Su silueta, gris, donde estaba, y se desvanece.
        const ghost = svg.cloneNode(true) as SVGSVGElement;
        ghost.classList.add("hero-stand-ghost");
        Object.assign(ghost.style, {
          left: `${before.left}px`,
          top: `${before.top}px`,
          width: `${before.width}px`,
          height: `${before.height}px`,
        });
        fxLayer().appendChild(ghost);
        jumpAside(pose, "smug");
        const now = heart();
        if (now) pop("バァーン", Math.min(vw - 70, Math.max(70, now.x)), Math.max(90, now.y - tall * 0.65), "power-pop-word is-gold is-big", 1000);
        for (let i = 0; i < 2; i++) {
          later(160 + i * 260, () => {
            const at1 = heart();
            if (!at1) return;
            const side = i % 2 ? -1 : 1;
            const gx = Math.min(vw - 30, Math.max(30, at1.x + side * tall * rand(0.36, 0.5)));
            pop("ゴ", gx, Math.max(90, at1.y - tall * rand(0.1, 0.45)), "power-pop-word is-purple", 1300);
          });
        }
      };
      const resume = () => {
        if (resumed) return;
        resumed = true;
        window.removeEventListener("jojo:timestop", onResume);
        appear();
        later(WORLD.joke, () => talk(setup, 1100));
        later(WORLD.punchline, () => {
          const at0 = heart();
          frame("stand", { body: pose, face: "laugh" });
          talk(punch, 1000);
          if (at0) pop(pickLine(lines.laughs), Math.min(vw - 60, at0.x + tall * 0.35), Math.max(90, at0.y - tall * 0.62), "power-pop-word is-gold", 1100);
        });
        later(WORLD.after, relay);
      };
      onResume = (event: Event) => {
        if (!(event as CustomEvent<TimeStopDetail>).detail.active) resume();
      };
      window.addEventListener("jojo:timestop", onResume);
      // Respaldo: si el tiempo no llego a detenerse (ya estaba detenido por
      // otro), aparece cuando ya no lo este.
      const check = () => {
        if (resumed) return;
        if (isTimeStopped()) later(150, check);
        else resume();
      };
      at(WORLD.stop + WORLD.ms + 900, check);
    };

    /** Devuelve al Stand grande a su sitio (y a su espejo) si ZA WARUDO lo movio. */
    const unmove = () => {
      if (!moved) return;
      moved = false;
      giant.style.left = giant.style.right = giant.style.bottom = "";
      if (svg) svg.style.scale = "";
    };

    // Lo que cada entrada de hero-intros/ pide deshacer (sus clases, sus capas, sus animaciones...).
    const cleanups: (() => void)[] = [];
    const runCleanups = () =>
      cleanups.splice(0).forEach((fn) => {
        try {
          fn();
        } catch {}
      });

    /*
      Saltar la entrada: un boton (y Esc) mientras dura. Va en el body, por
      encima de los efectos, y sigue funcionando con el tiempo detenido
      (data-time-free, ver lib/time-stop.ts). Se va en cuanto empieza el
      relevo.
    */
    let skipButton: HTMLButtonElement | null = null;
    const onSkipKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") skipIntro();
    };
    const removeSkip = () => {
      skipButton?.remove();
      skipButton = null;
      window.removeEventListener("keydown", onSkipKey);
    };

    /*
      Corte limpio, sin fundido: los dos son el mismo dibujo en el mismo
      sitio y tamano, y un fundido dejaria a los dos a media opacidad uno
      sobre otro (el nombre se transparentaria detras). Se quita la
      transicion de la capa del chico solo este fotograma.
    */
    const finish = (kind: IntroId | "skip" = intro) => {
      removeSkip();
      runCleanups();
      const layerEl = document.querySelector<HTMLElement>(".stand-layer");
      if (layerEl) layerEl.style.transition = "none";
      root.classList.remove("stand-manifest");
      giant.style.visibility = "hidden";
      requestAnimationFrame(() => requestAnimationFrame(() => layerEl && (layerEl.style.transition = "")));
      // Las capas de efectos, cuando ya se desvanecio lo que llevan.
      later(1500, () => layers.forEach((node) => node.remove()));
      // El chico remata con su frase (mini-stand.tsx). Si saltaste antes de
      // que empezara, se le avisa igual: no saluda encima de su frase.
      if (kind === "skip" && !introOn) window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "start", kind } }));
      if (show) window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "end", kind } }));
      introOn = false;
    };

    const condense = () => {
      removeSkip();
      hush();
      rushArms(false);
      if (body) body.style.rotate = body.style.scale = "";
      // Vuelve a mirar como el chico (espejado); el viaje sale de donde quedo.
      if (svg) svg.style.scale = "";
      // El mismo cuadro que recibe el chico: el cambio es pixel por pixel.
      frame("stand");
      const mini = document.querySelector<HTMLElement>(".stand-hit");
      const from = svg?.getBoundingClientRect();
      const to = mini?.getBoundingClientRect();
      if (!from?.width || !to?.width) {
        glass?.cancel();
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
        later(700, () => shattered?.cancel());
      };
      // Si el poder no llego a repararlas (hidratacion tardia), se reparan aqui.
      glass?.heal(to.left + to.width / 2, to.top + to.height / 2, duration);
      shattered?.mend(duration + 120);
      // El contorno de tinta crece hasta el grosor del chico (ver hero-stand.tsx).
      const rimPx = Math.max(1, Math.round(miniCell / 2));
      core.querySelectorAll(".hero-stand-rim").forEach((rim) => {
        keep(
          rim.animate([{ strokeWidth: "0.6" }, { strokeWidth: String((rimPx * 2) / miniCell) }], {
            duration,
            easing: "cubic-bezier(0.65, 0, 0.35, 1)",
            fill: "forwards",
          }),
        );
      });
    };

    let relayed = false;
    const relay = () => {
      if (relayed) return;
      relayed = true;
      // Lo que quedo del poder (el puno de impulso, la inclinacion) no viaja con el.
      animations.forEach((a) => a.effect && (a.effect as KeyframeEffect).target === body && a.cancel());
      condense();
    };

    /** Deshace todo lo de la entrada: al desmontar y al saltarla. */
    const teardown = () => {
      timers.splice(0).forEach((timer) => {
        window.clearTimeout(timer);
        window.clearInterval(timer);
      });
      animations.splice(0).forEach((a) => a.cancel());
      layers.splice(0).forEach((node) => node.remove());
      runCleanups();
      removeSkip();
      glass?.cancel();
      shattered?.cancel();
      glass = shattered = null;
      stage.classList.remove("hero-hitstop");
      stage.style.transformOrigin = "";
      if (body) body.style.rotate = body.style.scale = "";
      unmove();
      rushArms(false);
      if (svg) showHeroFrame(svg, "stand");
      root.classList.remove("intro-banner-low");
      window.removeEventListener("jojo:timestop", onResume);
    };

    /*
      Saltar: se corta todo, la entrada CSS queda en su ultimo cuadro, el
      tiempo vuelve si estaba detenido y el chico aparece ya en su sitio.
    */
    function skipIntro() {
      if (relayed) return;
      relayed = true;
      teardown();
      endTimeStop();
      finishEntrance(stage!);
      finish("skip");
    }

    const kit: IntroKit = {
      at,
      later,
      keep,
      onCleanup: (fn) => void cleanups.push(fn),
      fx: (className) => {
        const node = fxLayer();
        if (className) node.classList.add(...className.split(" "));
        return node;
      },
      behind: (className) => {
        const wrap = portraitRef.current?.closest(".hero-paste")?.parentElement;
        const box = wrap?.parentElement;
        const node = document.createElement("div");
        node.className = className ? `hero-behind ${className}` : "hero-behind";
        node.setAttribute("aria-hidden", "true");
        if (!wrap || !box) return kit.fx(className);
        // Mide la ventana aunque viva dentro del hero: se corre lo que el hero se corre.
        const r = box.getBoundingClientRect();
        Object.assign(node.style, { left: `${-r.left}px`, top: `${-r.top}px`, width: `${vw}px`, height: `${vh}px` });
        box.insertBefore(node, wrap);
        layers.push(node);
        return node;
      },
      tween: (ms, step, curve = (t) => t) => {
        const t0 = performance.now();
        let id = 0;
        const tick = (now: number) => {
          const t = Math.min(1, (now - t0) / ms);
          step(curve(t));
          if (t < 1) id = requestAnimationFrame(tick);
        };
        id = requestAnimationFrame(tick);
        cleanups.push(() => cancelAnimationFrame(id));
      },
      frame,
      heart,
      hand,
      tall: () => svg?.getBoundingClientRect().height ?? 200,
      lunge,
      jumpAside,
      talk,
      hush,
      shout,
      shake,
      stage,
      letters: letterEls,
      portrait: () => portraitRef.current,
      tagline: () => stage.querySelector("h1"),
      relay,
      vw,
      vh,
      small,
      language: languageRef.current,
      lines,
      jojo: jojoRef.current,
    };

    if (show) {
      skipButton = document.createElement("button");
      skipButton.type = "button";
      skipButton.className = "intro-skip power-live";
      skipButton.dataset.timeFree = "";
      skipButton.innerHTML = `<span>${jojoRef.current.skipIntro}</span><span class="intro-skip-icon" aria-hidden="true">▶▶</span>`;
      skipButton.style.animationDelay = `${Math.max(0, ENTRY.stand - elapsed)}ms`;
      skipButton.addEventListener("click", skipIntro);
      document.body.appendChild(skipButton);
      window.addEventListener("keydown", onSkipKey);

      if (def) {
        def.prepare?.(kit);
        at(def.start, () => {
          introOn = true;
          window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "start", kind: intro } }));
          def.run(kit);
        });
      } else at(intro === "world" ? WORLD.shout : DIAMOND.windup, intro === "world" ? manifestWorld : manifestDiamond);
    }
    // Con ZA WARUDO el relevo lo marca la vuelta del tiempo (ver WORLD).
    // Ultimo respaldo, antes de que la compuerta (stand-manifest-gate) lo suelte sola.
    at(show && intro === "world" ? WORLD.condense + 3000 : condenseAt, relay);
    return () => {
      teardown();
      if (introOn) window.dispatchEvent(new CustomEvent("jojo:intro", { detail: { phase: "cancel" } }));
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
    crema/tinta, apellido en oro. En celular, 27vw: CRISTIAN llena el
    ancho (en Anton mide ~3.3 veces el tamano de fuente); con 22vw se
    quedaba en tres cuartos de la pantalla y el hero se veia chico.
  */
  const nameBaseClassName =
    "w-full flex-nowrap justify-center whitespace-nowrap font-display transition-colors duration-500 text-[27vw] uppercase leading-[0.84] tracking-[0.01em] select-none sm:text-[18.5vw] md:text-[17vw] lg:text-[15.5vw]";
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
            <span className="manga-portrait relative block h-[104px] w-[72px] overflow-hidden bg-surface-2 sm:h-[146px] sm:w-[100px] md:h-[168px] md:w-[116px] lg:h-[194px] lg:w-[134px]">
              <Image
                src={portrait.local}
                alt={site.name}
                fill
                priority
                sizes="(min-width: 1024px) 134px, (min-width: 768px) 116px, (min-width: 640px) 100px, 72px"
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
              <div className="hero-stand-body">
                <HeroStand />
              </div>
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
