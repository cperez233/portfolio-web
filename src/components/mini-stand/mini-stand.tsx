"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { readSecrets, SECRET_IDS, unlockSecret } from "@/lib/secrets";
import type { StandEvent } from "@/lib/stand-events";
import { drawStand, POSES, SPRITE_H, SPRITE_W, type Body, type Frame, type Look } from "./sprite";
import { standLines, type GuideId, type PowerId, type StandLines } from "./lines";
import { Janken } from "./janken";
import { Darby } from "./darby";
import { StandChat } from "./stand-chat";
import { POWER_VARIANTS, runPower } from "./powers";
import { piecesOnScreen } from "./power-kit";
import { pickFrom, pickLine } from "./pick";
import type { TimeStopDetail } from "@/lib/time-stop";

/**
 * Mini Stand: Paranoid Android en pixel art, vivo por la pagina.
 *
 * Su caracter: un Stand dramatico que narra la pagina como un capitulo
 * de JoJo. Aterriza con un ドン, suelta ゴゴゴ cuando se queda quieto, hace
 * poses y habla con globos que se escriben letra a letra.
 *
 * - Vive en el retrato del hero. Al bajar sale volando y se posa encima
 *   de lo que se esta leyendo (data-spot); con raton, vuela al que tengas
 *   debajo del puntero. Al volver arriba regresa a casa.
 * - Cada lugar tiene varias frases, barajadas y sin repetir.
 * - Reacciona a lo que haces: cambiar tema o idioma, tocar WhatsApp (o
 *   dudar encima), copiar, volver a la pestana, bajar demasiado rapido,
 *   mirarlo fijo, cambiar de capitulo, abrir una pregunta, escribir en un
 *   formulario, enviarlo, llegar al final, y a los easter eggs.
 * - Saluda segun la hora y cuenta las visitas. Posado y con alguien
 *   leyendo, a ratos piensa en voz alta o hace un numero (pose, giro,
 *   golpes al aire, bostezo, mirar alrededor).
 * - Se puede agarrar y lanzar: vuela, rebota en los bordes y queda
 *   mareado. Al volar rapido deja estela, como Star Platinum, y se estira;
 *   al aterrizar se aplasta un instante.
 * - Con raton te sigue con los ojos (de lado y arriba o abajo). Si lo
 *   sobas (ir y venir encima de el) se pone feliz y suelta corazones; el
 *   clic derecho le da verguenza, y nota cuando el raton sale de la
 *   ventana, cuando se cae o vuelve el internet, cuando seleccionas un
 *   buen trozo de texto y cuando imprimes.
 * - Varias poses JoJo y caras (risa, guino, sonrojo, corazones, pensar):
 *   no repite siempre el mismo gesto.
 * - 12 s sin que pase nada: se duerme.
 * - Al tocarlo abre una conversacion: quien es, que hace el, llevarte a
 *   una parte, datos de JoJo, un poder prestado o un jan-ken.
 *
 * El dibujo es un canvas pequeno movido con transform; la fisica es un
 * muelle hacia el destino. Con reduced motion no vuela: queda en la
 * esquina, habla y juega.
 */

const SLEEP_MS = 12000;
const MOBILE_MAX = 30;
const TYPE_MS = 22;
/** Margen del canvas alrededor del sprite, en pixeles del sprite: cabe girando. */
const PAD_X = 16;
const PAD_TOP = 4;
const PAD_BOTTOM = 4;

type Action =
  | "punch"
  | "freeze"
  | "happy"
  | "shock"
  | "pose"
  | "dizzy"
  | "twirl"
  | "yawn"
  | "lookaround"
  | "smug"
  | "angry"
  | "sweat"
  | "starry"
  | "sad"
  | "laugh"
  | "love"
  | "wink"
  | "think"
  | "blush"
  /** Rafaga de punos hacia la pantalla (alterna los dos). */
  | "rush"
  | "emerge";

/** Acciones que son solo una cara. */
const FACES: Action[] = ["smug", "angry", "sweat", "starry", "sad", "laugh", "love", "wink", "think", "blush"];

interface Spot {
  el: Element;
  id: string;
  order: number[];
  said: number;
  outro: number;
  spokeAt: number;
}

function shuffle(n: number) {
  const list = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** Grito (globo de punta) o pensamiento (globo de nube). */
function toneOf(text: string, sleep: string) {
  if (text === sleep) return "think";
  const shout = /[!！]$/.test(text) && (text === text.toUpperCase() || /[\u30A0-\u30FF]/.test(text));
  return shout ? "shout" : "";
}

/** Visitas de este navegador (una por sesion). */
function countVisit() {
  try {
    const visits = Number(localStorage.getItem("jojo-visits") ?? 0) || 0;
    if (sessionStorage.getItem("jojo-visit")) return visits;
    sessionStorage.setItem("jojo-visit", "1");
    localStorage.setItem("jojo-visits", String(visits + 1));
    return visits + 1;
  } catch {
    return 1;
  }
}

export function MiniStand() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<StandLines>(standLines[language]);

  const [panel, setPanel] = useState<"chat" | "janken" | "darby" | null>(null);
  const [chats, setChats] = useState(0);
  // Tras arrastrarlo, el clic que llega al soltar no abre la conversacion.
  const dragged = useRef(false);
  const casting = useRef(false);
  const visitsRef = useRef(1);
  // Ultimas frases dichas (Bites the Dust las repite: deja vu).
  const saidLog = useRef<string[]>([]);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelOpen = useRef(false);
  // Ya abrio el chat alguna vez: no hace falta avisarle que se le puede tocar.
  const chatted = useRef(false);
  useEffect(() => {
    linesRef.current = standLines[language];
    panelOpen.current = panel !== null;
    if (panel) chatted.current = true;
  }, [language, panel]);

  // Puentes hacia el bucle de animacion.
  const say = useRef<(text: string | null, ms?: number) => void>(() => {});
  const act = useRef<(kind: Action, ms: number, look?: Look) => void>(() => {});
  // Cuenta como actividad (para que no se duerma justo al terminar un poder).
  const poke = useRef(() => {});
  // Aparecer en otro sitio sin volar (King Crimson se salta el viaje).
  const blink = useRef(() => {});
  const markRef = useRef<(text: string) => void>(() => {});
  const react = useRef<(kind: StandEvent, ms?: number) => void>(() => {});
  const probe = useRef(() => ({ x: 0, y: 0, pastScroll: 0, seen: 0, total: 0, minutes: 1 }));

  const closePanel = useCallback(() => {
    setPanel(null);
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bubble = bubbleRef.current;
    const button = buttonRef.current;
    const fx = fxRef.current;
    if (!canvas || !bubble || !button || !fx) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const short = (list: string[]) => (fine ? list : list.filter((line) => line.length <= MOBILE_MAX));

    let width = window.innerWidth;
    let height = window.innerHeight;
    let scale = 3;
    let cw = 0;
    let ch = 0;
    // Lo ultimo dibujado en el canvas (ver el bucle). Redimensionar lo borra.
    let drawn = "";
    function size() {
      drawn = "";
      width = window.innerWidth;
      height = window.innerHeight;
      scale = width < 640 ? 2 : 3;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      cw = (SPRITE_W + PAD_X) * scale;
      ch = (SPRITE_H + PAD_TOP + PAD_BOTTOM) * scale;
      canvas!.width = Math.round(cw * ratio);
      canvas!.height = Math.round(ch * ratio);
      canvas!.style.width = `${cw}px`;
      canvas!.style.height = `${ch}px`;
      ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx!.imageSmoothingEnabled = false;
      button!.style.width = `${SPRITE_W * scale}px`;
      button!.style.height = `${SPRITE_H * scale}px`;
    }
    size();

    // --- Estado --------------------------------------------------------
    const body = { x: width + 60, y: height * 0.4, vx: 0, vy: 0, face: -1 as 1 | -1 };
    let mode: "home" | "out" = "home";
    let frameTime = performance.now();
    let blinkUntil = 0;
    let nextBlink = performance.now() + 2500;
    let nextFlourish = performance.now() + 6000;
    let nextAura = performance.now() + 3000;
    let sleeping = false;
    let lastActivity = performance.now();
    let action: { kind: Action; from: number; until: number; look?: Look } | null = null;
    // Aplastado al aterrizar: se recupera solo (ver el bucle).
    let squashUntil = 0;
    let lastSpokeAt = -Infinity;
    let pointerX = width / 2;
    let pointerY = height / 2;
    let stareSince = 0;
    let lastStare = -Infinity;
    let hovered: Spot | null = null;
    let current: Spot | null = null;
    let candidate: Spot | null = null;
    let candidateSince = 0;
    let settledSince = 0;
    let spokeHere = false;
    let landedHere = false;
    let raf = 0;
    let stopped = false;
    let greeted = false;
    // Ya esta en su sitio de partida (ver el relevo con el Stand grande del hero).
    let placed = false;
    // Entrada con ZA WARUDO (hero): el Stand se mueve con el tiempo detenido.
    let introWorld = false;
    let wasManifesting = false;
    let saidBottom = false;
    let nudged = false;
    let freeUntil = 0;
    let nextGhost = 0;
    let nextStar = 0;
    let drag: { id: number; sx: number; sy: number; moved: boolean; t: number; vx: number; vy: number } | null = null;
    /*
      Para que no se vea guionado: cada viaje tiene su propio caracter
      (rapido, perezoso, con rebote o sin el) y una curva hacia un lado
      al azar, y en cada repisa se para en un punto distinto, no siempre
      en la punta derecha. Quieto, de vez en cuando se acomoda: da un
      saltito, camina un poco por la repisa o se voltea.
    */
    type Flight = { tx: number; ty: number; d0: number; nx: number; ny: number; amp: number; k: number; c: number; hop: boolean; landed: boolean };
    let flight: Flight | null = null;
    let perchFrac = 0.8;
    let roam = { x: 0.86, y: 0.38 };
    let hopNext = 0;
    let restFace: 1 | -1 = 1;
    let nextFidget = performance.now() + 9000;
    let hopLandAt = 0;
    // Fase propia del vaiven de reposo: no respira al compas de un metronomo.
    const bobPhase = [Math.random() * 6.28, Math.random() * 6.28];
    function newFlight(tx: number, ty: number, hopAmp = 0): Flight {
      const dx = tx - body.x;
      const dy = ty - body.y;
      const d0 = Math.max(1, Math.hypot(dx, dy));
      const nx = -dy / d0;
      const ny = dx / d0;
      let amp = hopAmp;
      if (hopAmp) {
        // Un saltito: la curva siempre hacia arriba.
        if (ny * amp > 0) amp = -amp;
      } else if (d0 > 90) {
        amp = (Math.random() < 0.5 ? -1 : 1) * (0.1 + Math.random() * 0.22) * Math.min(d0, 640);
      }
      const k = hopAmp ? 120 : [38, 52, 64, 90][Math.floor(Math.random() * 4)];
      const zeta = hopAmp ? 0.8 : 0.55 + Math.random() * 0.35;
      return { tx, ty, d0, nx, ny, amp, k, c: 2 * zeta * Math.sqrt(k), hop: hopAmp !== 0, landed: false };
    }
    function pickPerch(isTitle: boolean) {
      // En un titulo, de la mitad hacia el final: al principio taparia el rotulo de la parte.
      const lo = isTitle ? 0.4 : 0.1;
      let next = lo + Math.random() * (1 - lo);
      for (let i = 0; i < 4 && Math.abs(next - perchFrac) < 0.22; i++) next = lo + Math.random() * (1 - lo);
      perchFrac = next;
    }
    const visits = countVisit();
    visitsRef.current = visits;
    const seen = new Set<string>();
    const scrollLog: { t: number; y: number }[] = [];

    // Globo: se mide con el texto entero y se escribe letra a letra.
    let typing = { text: "", shown: 0, next: 0 };
    let bubbleUntil = 0;
    let bw = 0;
    let bh = 0;
    say.current = (text, ms = 2800) => {
      if (!text) {
        bubble.removeAttribute("data-on");
        bubbleUntil = 0;
        typing = { text: "", shown: 0, next: 0 };
        return;
      }
      lastSpokeAt = performance.now();
      if (text !== linesRef.current.sleep) saidLog.current = [...saidLog.current, text].slice(-4);
      bubble.style.width = "";
      bubble.textContent = text;
      const tone = toneOf(text, linesRef.current.sleep);
      if (tone) bubble.setAttribute("data-tone", tone);
      else bubble.removeAttribute("data-tone");
      bubble.setAttribute("data-on", "");
      bw = bubble.offsetWidth;
      bh = bubble.offsetHeight;
      // Ancho fijo mientras escribe: el globo no "crece" letra a letra.
      bubble.style.width = `${bw}px`;
      const instant = reducedMotion || text === linesRef.current.sleep;
      typing = { text, shown: instant ? text.length : 0, next: performance.now() };
      if (!instant) bubble.textContent = "";
      bubbleUntil = ms === Infinity ? Infinity : performance.now() + ms + text.length * TYPE_MS;
    };
    poke.current = () => {
      lastActivity = performance.now();
      sleeping = false;
    };
    act.current = (kind, ms, look) => {
      const now = performance.now();
      // Cada pose es una distinta, salvo que se pida una en particular.
      const body: Body | undefined = kind === "pose" ? (look?.body ?? POSES[Math.floor(Math.random() * POSES.length)]) : look?.body;
      action = { kind, from: now, until: now + ms, look: body || look?.face ? { ...look, body } : undefined };
    };

    // Onomatopeyas, aura, polvo y estrellas: elementos sueltos que se van solos.
    const LIFE = { sfx: 900, aura: 2200, dust: 600, star: 900, mark: 1300, heart: 1100 };
    function sfx(text: string, kind: keyof typeof LIFE, dx?: number, dy = -SPRITE_H * scale * 0.9) {
      const node = document.createElement("span");
      node.className = `stand-${kind}`;
      node.textContent = text;
      const x = dx ?? (kind === "sfx" ? (body.face > 0 ? -28 : 28) : kind === "mark" ? SPRITE_W * scale * 0.55 * body.face : (Math.random() - 0.5) * 30);
      node.style.transform = `translate3d(${Math.round(body.x + x)}px, ${Math.round(body.y + dy)}px, 0)`;
      if (kind === "dust") node.style.setProperty("--dust-x", `${Math.sign(x) * 14}px`);
      fx!.appendChild(node);
      window.setTimeout(() => node.remove(), LIFE[kind]);
    }

    /** Corazones rosas que suben desde el (lo sobaste, o vas a escribirle). */
    function hearts(n: number) {
      for (let i = 0; i < n; i++) {
        window.setTimeout(() => sfx("♥", "heart", (Math.random() - 0.5) * SPRITE_W * scale, -SPRITE_H * scale * (0.6 + Math.random() * 0.3)), i * 160);
      }
    }

    // Copia del cuadro actual (estela al volar, o la copia quieta del tiempo detenido).
    function snapshot(className: string) {
      const copy = document.createElement("canvas");
      copy.width = canvas!.width;
      copy.height = canvas!.height;
      copy.style.width = canvas!.style.width;
      copy.style.height = canvas!.style.height;
      copy.style.transform = canvas!.style.transform;
      copy.className = className;
      copy.getContext("2d")?.drawImage(canvas!, 0, 0);
      fx!.appendChild(copy);
      return copy;
    }
    function ghost() {
      const copy = snapshot("stand-ghost");
      window.setTimeout(() => copy.remove(), 320);
    }

    // --- Lugares donde posarse ----------------------------------------
    const spots: Spot[] = [];
    const onEnter = (event: Event) => {
      hovered = spots.find((spot) => spot.el === event.currentTarget) ?? null;
    };
    const onLeave = (event: Event) => {
      if (hovered?.el === event.currentTarget) hovered = null;
    };
    function track(el: Element) {
      if (spots.some((spot) => spot.el === el)) return;
      const id = el.getAttribute("data-spot") ?? "";
      const lines = short(linesRef.current.spots[id] ?? []);
      spots.push({ el, id, order: shuffle(lines.length), said: 0, outro: 0, spokeAt: -Infinity });
      if (fine) {
        el.addEventListener("pointerenter", onEnter);
        el.addEventListener("pointerleave", onLeave);
      }
    }
    document.querySelectorAll("[data-spot]").forEach(track);
    /*
      Agrupado: cada letra que escribe el globo es una mutacion, y recorrer
      todo el documento por cada una se notaba en celulares lentos.
    */
    let rescan = 0;
    const watcher = new MutationObserver(() => {
      if (rescan) return;
      rescan = window.setTimeout(() => {
        rescan = 0;
        for (let i = spots.length - 1; i >= 0; i--) if (!spots[i].el.isConnected) spots.splice(i, 1);
        document.querySelectorAll("[data-spot]").forEach(track);
      }, 250);
    });
    watcher.observe(document.body, { childList: true, subtree: true });

    // Un titulo ocupa todo el ancho: se mide su texto para posarse al final.
    const range = document.createRange();
    /*
      Si el titulo tiene encima su rotulo ("Parte 5 · Lo que hago"), se
      para sobre el rotulo: parado sobre un titulo corto lo tapaba.
    */
    function eyebrowOf(el: Element) {
      const prev = el.previousElementSibling;
      return prev?.classList.contains("jojo-eyebrow") ? prev : null;
    }
    function spotRect(spot: Spot) {
      if (spot.el.tagName !== "H2") return spot.el.getBoundingClientRect();
      const eyebrow = eyebrowOf(spot.el);
      if (eyebrow) {
        // Es flex y ocupa todo el ancho: de la placa hasta donde acaba su texto.
        const box = eyebrow.getBoundingClientRect();
        range.selectNodeContents(eyebrow);
        const text = range.getBoundingClientRect();
        return new DOMRect(box.left, box.top, Math.max(text.right, box.left + 40) - box.left, box.height);
      }
      range.selectNodeContents(spot.el);
      return range.getBoundingClientRect();
    }

    function nextLine(spot: Spot) {
      const lines = short(linesRef.current.spots[spot.id] ?? []);
      if (!lines.length) return null;
      if (spot.said < spot.order.length) return lines[spot.order[spot.said++]] ?? lines[0];
      const outro = short(linesRef.current.outro);
      const line = outro[spot.outro++ % outro.length];
      if (spot.outro >= outro.length) Object.assign(spot, { order: shuffle(lines.length), said: 0, outro: 0 });
      return line;
    }

    // Partes leidas (para Hermit Purple).
    const sectionEls = [...document.querySelectorAll("main section[id], footer[id]")];
    const seenObserver = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && seen.add(entry.target.id)),
      { threshold: 0.25 },
    );
    sectionEls.forEach((el) => seenObserver.observe(el));

    probe.current = () => {
      const now = performance.now();
      const past = scrollLog.find((entry) => now - entry.t < 20000) ?? { y: 0 };
      return {
        x: body.x,
        y: body.y - SPRITE_H * scale * 0.5,
        pastScroll: past.y,
        seen: seen.size,
        total: sectionEls.length,
        minutes: Math.max(1, Math.round(now / 60000)),
      };
    };

    // --- Reacciones a lo que pasa ---------------------------------------
    const lastReaction: Partial<Record<StandEvent, number>> = {};
    react.current = (kind, ms = 2600) => {
      const now = performance.now();
      // Las reacciones de ambiente no se repiten seguido.
      const ambient = [
        "copy",
        "fastScroll",
        "stare",
        "return",
        "language",
        "chapter",
        "faq",
        "hesitate",
        "typing",
        "resize",
        "pet",
        "rightclick",
        "leave",
        "select",
        "spin",
        "service",
        "plan",
        "review",
        "visit",
        "github",
        "gallery",
      ].includes(kind);
      if (ambient && now - (lastReaction[kind] ?? -Infinity) < 25000) return;
      lastReaction[kind] = now;
      if (sleeping) {
        sleeping = false;
        lastActivity = now;
      }
      const line = pickLine(short(linesRef.current.events[kind]));
      // El tiempo detenido lo maneja onTimeStop: ahi el Stand es el unico que se mueve.
      if (kind === "timestop") return;
      // Cara y marca de manga segun lo que paso.
      const faces: Partial<Record<StandEvent, [Action, number, string?]>> = {
        thrown: ["dizzy", 2000],
        ora: ["punch", 900],
        barrage: ["punch", 900],
        muda: ["angry", 1600, "＃"],
        arrow: ["shock", 1400, "!?"],
        fastScroll: ["sweat", 1600, "!!"],
        themeLight: ["angry", 1400, "!"],
        themeDark: ["smug", 1600],
        resize: ["sweat", 1400, "?"],
        whatsapp: ["love", 1800],
        sent: ["love", 1800],
        bottom: ["starry", 1800],
        chapter: ["pose", 1500],
        faq: Math.random() < 0.5 ? ["think", 1600, "？"] : ["lookaround", 1600],
        typing: Math.random() < 0.5 ? ["lookaround", 1600] : ["blush", 1400],
        audit: ["think", 1800, "…"],
        dropped: ["twirl", 700],
        stare: [Math.random() < 0.5 ? "smug" : "blush", 1600, "…"],
        return: ["sad", 1600, "…"],
        copy: ["wink", 1400],
        language: ["happy", 1400, "♪"],
        hesitate: ["starry", 1400],
        tbc: ["pose", 1500],
        pet: ["love", 2200],
        rightclick: ["blush", 1800, "!?"],
        leave: ["sad", 1800, "…"],
        offline: ["sweat", 1800, "!?"],
        online: ["happy", 1400, "♪"],
        select: ["think", 1800, "…"],
        print: ["starry", 1800],
        spin: ["laugh", 1700],
        service: ["think", 1600, "…"],
        plan: ["starry", 1600, "$"],
        review: ["blush", 1800],
        visit: ["wink", 1400, "✦"],
        github: ["smug", 1600, "!"],
        gallery: ["love", 1500],
      };
      const [face, faceMs, mark] = faces[kind] ?? ["happy", 1400];
      act.current(face, faceMs);
      if (mark) sfx(mark, "mark");
      if (kind === "whatsapp" || kind === "sent" || kind === "bottom") sfx("ドン!", "sfx");
      else if (kind === "chapter") sfx("バァーン", "sfx");
      else if (kind === "spin") sfx("ブン!", "sfx");
      if (kind === "pet" || kind === "whatsapp" || kind === "sent") hearts(kind === "pet" ? 4 : 2);
      else if (kind === "review" || kind === "gallery") hearts(1);
      say.current(line, ms);
    };

    // --- Tiempo detenido ----------------------------------------------
    /*
      Con el tiempo detenido todo queda congelado, el tambien: no se
      dibuja, no habla, no vuela (asi se ve en la serie desde afuera).
      - Si lo detuvo el (ZA WARUDO), al reanudarse ya esta en otro sitio
        de lo que se ve, en una pose JoJo y riendose: queda su silueta un
        instante donde estaba. Se burla segun la seccion (o de que
        intentaste moverte).
      - Si lo detuvo el retrato, a el tambien lo agarro: queda sudando.
    */
    type Point = { x: number; y: number };
    let stop: { by: TimeStopDetail["by"]; at: number; attempted: boolean } | null = null;
    let hold: Point | null = null;
    let holdUntil = 0;

    function sectionId() {
      if (mode === "home") return "hero";
      return current?.id ?? "default";
    }
    function clampPoint(p: Point): Point {
      const spriteW = SPRITE_W * scale;
      return {
        x: Math.min(width - spriteW / 2 - 8, Math.max(spriteW / 2 + 8, p.x)),
        y: Math.min(height - 8, Math.max(SPRITE_H * scale + 70, p.y)),
      };
    }
    function visibleRects() {
      return piecesOnScreen(24)
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width > 40 && r.height > 16);
    }
    /** Aparece en otro sitio de lo que se ve, sin volar. Devuelve a donde. */
    function teleport(avoid?: Element, holdMs = 4500) {
      const from = { x: body.x, y: body.y };
      const rects = visibleRects().filter(({ el }) => el !== avoid);
      const dist = (r: DOMRect) => Math.hypot(r.left + r.width / 2 - from.x, r.top - from.y);
      // Lo bastante lejos para que se note el salto, pero sin ir siempre al mismo extremo.
      const far = rects.filter(({ r }) => dist(r) > Math.min(width, height) * 0.3);
      const pool = far.length ? far : rects;
      const dest = pool[Math.floor(Math.random() * pool.length)]?.r;
      const point = dest
        ? clampPoint({ x: dest.left + Math.min(dest.width * 0.75, SPRITE_W * scale * 1.5), y: dest.top - 1 })
        : clampPoint({ x: width - from.x, y: height * 0.4 });
      // Silueta donde estaba, que se desvanece.
      const left = snapshot("stand-frozen");
      window.setTimeout(() => left.classList.add("is-leaving"), 40);
      window.setTimeout(() => left.remove(), 450);
      body.x = point.x;
      body.y = point.y;
      body.vx = 0;
      body.vy = 0;
      hold = point;
      holdUntil = performance.now() + holdMs;
      landedHere = true;
      return point;
    }
    const onTimeStop = (event: Event) => {
      const { active, by } = (event as CustomEvent<TimeStopDetail>).detail;
      // En la entrada con ZA WARUDO el Stand no se congela ni se burla al
      // reanudarse: se mueve durante el tiempo detenido (ver onIntro).
      if (introWorld && by === "stand") return;
      const now = performance.now();
      if (active) {
        stop = { by, at: now, attempted: false };
        // Su ZA WARUDO: mientras el tiempo esta detenido no se ve nada, ni
        // su globo. Aparece posando en otro sitio cuando vuelve.
        if (by === "stand") say.current(null);
        return;
      }
      if (!stop) return;
      const { at, attempted } = stop;
      const paused = now - at;
      stop = null;
      // El reloj interno del Stand tambien estuvo detenido.
      bubbleUntil += paused;
      if (action) {
        action.from += paused;
        action.until += paused;
      }
      lastActivity = now;
      sleeping = false;
      // Star Platinum: The World ya cierra con la frase del poder; hablar aqui la encimaba.
      if (reducedMotion || by === "platinum") return;
      const lines = linesRef.current;
      if (by === "page") {
        act.current("sweat", 1800);
        sfx("!?", "mark");
        say.current(pickLine(short(lines.events.timestop)), 2600);
        return;
      }
      if (by === "stand") {
        // Ya esta en otro sitio, en una pose JoJo, y se rie.
        teleport();
        sfx("バァーン", "sfx");
        sfx("ゴゴゴ", "aura");
        act.current("pose", 2400, { face: "laugh" });
      } else act.current("smug", 2000);
      sfx("フフフ", "mark");
      const sections = lines.timeStop.sections;
      say.current(
        pickLine(short(attempted ? lines.timeStop.attempt : (sections[sectionId()] ?? sections.default))),
        2400,
      );
      window.setTimeout(() => {
        if (!stop) say.current(pickLine(short(lines.timeStop.resume)), 2200);
      }, 3400);
    };
    const onAttempt = () => {
      if (stop) stop.attempted = true;
    };
    /*
      Las entradas del hero (portfolio-hero.tsx) avisan con "jojo:intro":
      start (empieza el poder; con ZA WARUDO el tiempo se detiene y el
      chico espera escondido), end (el grande ya se hizo el chico: remata
      con una frase de la entrada que toco y, un rato despues, saluda
      segun la hora) y cancel (se desmonto a medias: solo se limpia).
    */
    let greetLater = 0;
    const onIntro = (event: Event) => {
      const { phase, kind } = (event as CustomEvent<{ phase: string; kind?: "world" | "diamond" }>).detail ?? {};
      const root = document.documentElement;
      if (phase === "start") {
        introWorld = kind === "world";
        // El saludo va despues de la frase del final.
        greeted = true;
        if (introWorld) root.classList.add("intro-world");
        return;
      }
      introWorld = false;
      root.classList.remove("intro-world");
      if (phase !== "end") return;
      const lines = linesRef.current;
      say.current(pickLine(short(kind === "diamond" ? lines.intro.diamond : lines.intro.world)), 2600);
      // La cara, cuando termina el cuadro del relevo (emerge, 800ms).
      window.setTimeout(() => {
        if (kind === "diamond") {
          act.current("wink", 1500);
          sfx("✦", "mark");
        } else {
          act.current("smug", 1500);
          sfx("フフフ", "mark");
        }
      }, 850);
      window.clearTimeout(greetLater);
      greetLater = window.setTimeout(() => {
        greeted = false;
        if (!sleeping && !panelOpen.current && performance.now() - lastSpokeAt > 2500) greet();
        else greeted = true;
      }, 5200);
    };
    window.addEventListener("jojo:intro", onIntro);
    window.addEventListener("jojo:timestop", onTimeStop);
    window.addEventListener("jojo:timestop-attempt", onAttempt);
    markRef.current = (text) => sfx(text, "mark");
    blink.current = () => {
      teleport();
      sfx("ドン!", "sfx");
    };

    // --- Actividad, sueno y gestos ---------------------------------------
    function activity() {
      lastActivity = performance.now();
      if (sleeping) {
        sleeping = false;
        say.current(pickLine(short(linesRef.current.wake)), 2200);
      }
    }
    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      activity();
      if (event.pointerType === "mouse" && !reducedMotion) rub(event.clientX, event.clientY);
    };
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    const onScroll = () => {
      activity();
      const now = performance.now();
      const y = window.scrollY;
      const speed = Math.abs(y - lastScrollY) / Math.max(16, now - lastScrollT);
      lastScrollY = y;
      lastScrollT = now;
      if (!scrollLog.length || now - scrollLog[scrollLog.length - 1].t > 2000) {
        scrollLog.push({ t: now, y });
        if (scrollLog.length > 20) scrollLog.shift();
      }
      // Mas de 6 px por ms: una pantalla en un parpadeo.
      if (speed > 6 && mode === "out") react.current("fastScroll");
      if (!saidBottom && y + window.innerHeight >= document.documentElement.scrollHeight - 4) {
        saidBottom = true;
        react.current("bottom", 3200);
      }
    };
    const onClickAnywhere = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest) return;
      if (target.closest("a[href*='wa.me']")) react.current("whatsapp");
      else if (target.closest("#projects [role='tab']")) react.current("chapter");
      else if (target.closest("#faq button[aria-expanded='false']")) react.current("faq");
      else if (target.closest("#services button[aria-expanded='false']")) react.current("service");
      else if (target.closest("#pricing [role='tab']")) react.current("plan");
      else if (target.closest("a[href*='github.com']")) react.current("github");
      else if (target.closest("figure a[target='_blank']")) react.current("review");
      else if (target.closest("main a[target='_blank']")) react.current("visit");
    };
    /*
      Quedarse con el puntero encima de algo: dudar sobre WhatsApp le da
      animo, leer una resena lo sonroja y mirar un plan lo pone a sacar
      cuentas.
    */
    const dwell: [string, StandEvent, number][] = [
      ["a[href*='wa.me']", "hesitate", 1600],
      [".speech-panel", "review", 1800],
      ["#pricing article", "plan", 2000],
    ];
    let hesitateTimer = 0;
    let dwellOn: Element | null = null;
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const target = event.target as Element | null;
      for (const [selector, kind, ms] of dwell) {
        const el = target?.closest?.(selector);
        if (!el) continue;
        if (el === dwellOn) return;
        dwellOn = el;
        window.clearTimeout(hesitateTimer);
        hesitateTimer = window.setTimeout(() => react.current(kind), ms);
        return;
      }
      dwellOn = null;
      window.clearTimeout(hesitateTimer);
    };
    // Deslizar las capturas de un caso (la fila de la galeria).
    const onAnyScroll = (event: Event) => {
      const el = event.target as Element | null;
      if (el instanceof Element && el.matches("#projects ul") && el.scrollLeft > 40) react.current("gallery");
    };
    const onFocusIn = (event: FocusEvent) => {
      const field = event.target as Element | null;
      if (field?.matches?.("main input, main textarea, footer input, footer textarea")) react.current("typing");
    };
    /*
      Sobarlo: con raton, ir y venir encima de el. Cuenta los cambios de
      direccion del puntero sobre el sprite; cuatro en poco mas de un
      segundo es una caricia.
    */
    let rubTurns = 0;
    let rubDir = 0;
    let rubLastX = 0;
    let rubSince = 0;
    function rub(x: number, y: number) {
      const spriteW = SPRITE_W * scale;
      const spriteH = SPRITE_H * scale;
      const over = Math.abs(x - body.x) < spriteW * 0.6 && y < body.y + 4 && y > body.y - spriteH - 4;
      const now = performance.now();
      if (!over || drag) {
        rubTurns = 0;
        return;
      }
      const dx = x - rubLastX;
      rubLastX = x;
      if (Math.abs(dx) < 2) return;
      const dir = Math.sign(dx);
      if (dir !== rubDir) {
        rubDir = dir;
        if (now - rubSince > 1400) rubTurns = 0;
        if (!rubTurns) rubSince = now;
        rubTurns += 1;
      }
      if (rubTurns >= 5 && now - rubSince < 1600) {
        rubTurns = 0;
        react.current("pet", 2400);
      }
    }
    const onContextMenu = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.("input, textarea")) return;
      react.current("rightclick");
    };
    const onLeaveWindow = (event: MouseEvent) => {
      if (fine && !event.relatedTarget && event.clientY <= 0) react.current("leave");
    };
    const onOffline = () => react.current("offline", 2600);
    const onOnline = () => react.current("online", 2200);
    const onPrint = () => react.current("print");
    // Seleccionar un buen trozo de texto (con calma: se espera a que suelte).
    let selectTimer = 0;
    const onSelection = () => {
      window.clearTimeout(selectTimer);
      selectTimer = window.setTimeout(() => {
        const text = document.getSelection()?.toString().trim() ?? "";
        if (text.length > 24) react.current("select");
      }, 900);
    };
    let resizeTimer = 0;
    let lastWidth = width;
    const onResize = () => {
      size();
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (Math.abs(window.innerWidth - lastWidth) > 120) react.current("resize");
        lastWidth = window.innerWidth;
      }, 500);
    };

    // Agarrarlo y lanzarlo.
    const onGrab = (event: PointerEvent) => {
      if (reducedMotion || event.button > 0) return;
      drag = { id: event.pointerId, sx: event.clientX, sy: event.clientY, moved: false, t: performance.now(), vx: 0, vy: 0 };
    };
    const onDrag = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      if (!drag.moved && Math.hypot(event.clientX - drag.sx, event.clientY - drag.sy) > 8) {
        drag.moved = true;
        button.setPointerCapture(event.pointerId);
        sleeping = false;
        say.current(null);
        act.current("shock", 600);
      }
      if (!drag.moved) return;
      const now = performance.now();
      const dt = Math.max(8, now - drag.t) / 1000;
      const nx = event.clientX;
      const ny = event.clientY + SPRITE_H * scale * 0.5;
      // Velocidad suavizada: la del ultimo tramo manda al soltar.
      drag.vx = drag.vx * 0.4 + ((nx - body.x) / dt) * 0.6;
      drag.vy = drag.vy * 0.4 + ((ny - body.y) / dt) * 0.6;
      drag.t = now;
      body.x = nx;
      body.y = ny;
      body.vx = 0;
      body.vy = 0;
    };
    const onDrop = (event: PointerEvent) => {
      if (!drag || drag.id !== event.pointerId) return;
      const was = drag;
      drag = null;
      if (button.hasPointerCapture(event.pointerId)) button.releasePointerCapture(event.pointerId);
      if (!was.moved) return;
      dragged.current = true;
      window.setTimeout(() => (dragged.current = false), 0);
      const limit = 2600;
      body.vx = Math.max(-limit, Math.min(limit, was.vx));
      body.vy = Math.max(-limit, Math.min(limit, was.vy));
      const speed = Math.hypot(body.vx, body.vy);
      lastActivity = performance.now();
      if (speed > 900) {
        freeUntil = performance.now() + 900;
        react.current("thrown", 2400);
      } else react.current("dropped", 2200);
    };
    button.addEventListener("pointerdown", onGrab);
    button.addEventListener("pointermove", onDrag);
    button.addEventListener("pointerup", onDrop);
    button.addEventListener("pointercancel", onDrop);
    const onCopy = () => react.current("copy");
    let hiddenAt = 0;
    const onVisibility = () => {
      if (document.hidden) hiddenAt = performance.now();
      else if (hiddenAt && performance.now() - hiddenAt > 4000) react.current("return");
    };
    let wasDark = document.documentElement.classList.contains("dark");
    const themeWatcher = new MutationObserver(() => {
      const dark = document.documentElement.classList.contains("dark");
      if (dark !== wasDark) {
        wasDark = dark;
        react.current(dark ? "themeDark" : "themeLight");
      }
    });
    themeWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    for (const name of ["pointerdown", "keydown", "wheel", "touchstart"] as const) {
      window.addEventListener(name, activity, { passive: true });
    }
    document.addEventListener("click", onClickAnywhere, true);
    document.addEventListener("copy", onCopy);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("scroll", onAnyScroll, { capture: true, passive: true });
    document.addEventListener("focusin", onFocusIn);
    window.addEventListener("resize", onResize);
    document.addEventListener("contextmenu", onContextMenu);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    document.addEventListener("selectionchange", onSelection);
    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);
    window.addEventListener("beforeprint", onPrint);

    // --- Bucle --------------------------------------------------------
    /*
      Medir el layout cada cuadro obliga al navegador a recalcularlo: en
      celulares lentos eso era el lag al hacer scroll. Los nodos fijos se
      guardan y el barrido de sitios (que mide todos) va cada 150 ms; el
      sitio elegido igual espera 450 ms antes de cambiar, no se nota.
    */
    let heroEl: Element | null = null;
    let homeEl: Element | null = null;
    const cached = (el: Element | null, selector: string) => (el?.isConnected ? el : document.querySelector(selector));
    let scanned: Spot | null = null;
    let nextScan = 0;
    // Saludo segun la hora del visitante (madrugada, amanecer, mañana,
    // mediodia, tarde, noche y noche cerrada) o por las visitas.
    function greet() {
      if (greeted) return;
      greeted = true;
      const hour = new Date().getHours();
      const greetings = linesRef.current.greetings;
      if (visits > 1 && hour >= 5 && Math.random() < 0.5) {
        say.current(pickLine(short(greetings.visit)).replace("{n}", String(visits)), 2800);
        return;
      }
      const slot =
        hour < 5 ? "owl" : hour < 8 ? "early" : hour < 12 ? "morning" : hour < 14 ? "midday" : hour < 19 ? "afternoon" : hour < 22 ? "evening" : "late";
      if (slot === "owl") unlockSecret("night");
      say.current(pickLine(short(greetings[slot])), slot === "owl" ? 3200 : 2800);
    }

    function tick(now: number) {
      if (stopped) return;
      // Tiempo detenido: el tambien queda congelado (ni se dibuja).
      if (stop) {
        frameTime = now;
        raf = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(1 / 30, (now - frameTime) / 1000);
      frameTime = now;
      const spriteW = SPRITE_W * scale;
      const spriteH = SPRITE_H * scale;

      if (now > nextBlink) {
        blinkUntil = now + 130;
        nextBlink = now + 2600 + Math.random() * 3600;
      }
      if (action && now > action.until) action = null;

      const frozen = action?.kind === "freeze";
      if (!sleeping && !panelOpen.current && !casting.current && now - lastActivity > SLEEP_MS) {
        sleeping = true;
        say.current(linesRef.current.sleep, Infinity);
        unlockSecret("sleep");
      }

      // Destino.
      heroEl = cached(heroEl, "[data-stand-hero]");
      const heroRect = heroEl?.getBoundingClientRect();
      if (mode === "home" && heroRect && heroRect.bottom < height * 0.45) mode = "out";
      else if (mode === "out" && heroRect && heroRect.bottom > height * 0.6) {
        mode = "home";
        current = null;
        say.current(Math.random() < 0.4 && !sleeping ? pickLine(short(linesRef.current.home)) : null, 1800);
      }

      let tx: number;
      let ty: number;
      let perched = false;
      const dialog = panelOpen.current ? panelRef.current : null;
      if (reducedMotion) {
        tx = width - spriteW / 2 - 16;
        ty = height - 16;
      } else if (hold && now < holdUntil) {
        tx = hold.x;
        ty = hold.y;
        perched = true;
      } else if (dialog) {
        const rect = dialog.getBoundingClientRect();
        tx = rect.right - spriteW;
        ty = rect.top - 1;
        perched = true;
      } else if (mode === "home") {
        homeEl = cached(homeEl, "[data-stand-home]");
        const rect = homeEl?.getBoundingClientRect();
        if (rect) {
          tx = rect.right - spriteW * 0.25;
          ty = rect.top + spriteH * 0.35;
          perched = true;
        } else {
          tx = width - spriteW;
          ty = height * 0.35;
        }
      } else {
        let best: Spot | null = null;
        if (hovered) best = hovered;
        else if (now < nextScan) best = scanned;
        else {
          nextScan = now + 150;
          let score = -Infinity;
          for (const spot of spots) {
            const rect = spotRect(spot);
            if (rect.bottom < 90 || rect.top > height - 90 || rect.width === 0) continue;
            const value = -Math.abs(rect.top - height * 0.33);
            if (value > score) {
              score = value;
              best = spot;
            }
          }
          scanned = best;
        }
        if (best !== candidate) {
          candidate = best;
          candidateSince = now;
        }
        if (candidate !== current && now - candidateSince > 450) {
          current = candidate;
          if (current) pickPerch(current.el.tagName === "H2" && !eyebrowOf(current.el));
          // Sin repisa a la vista: flota a un lado, no siempre el derecho.
          else roam = { x: Math.random() < 0.5 ? 0.14 : 0.86, y: 0.3 + Math.random() * 0.18 };
          restFace = Math.random() < 0.2 ? -1 : 1;
          nextFidget = now + 7000 + Math.random() * 8000;
          spokeHere = false;
          landedHere = false;
          settledSince = 0;
          if (!sleeping) say.current(null);
        }
        if (current) {
          const rect = spotRect(current);
          const lo = rect.left + spriteW * 0.6;
          const hi = Math.max(lo, Math.min(rect.right, width - 8) - spriteW * 0.6);
          tx = lo + (hi - lo) * perchFrac;
          ty = Math.max(70, rect.top - 1);
          perched = true;
        } else {
          tx = Math.min(width - spriteW - 24, Math.max(spriteW + 24, width * roam.x));
          ty = height * roam.y;
        }
      }

      /*
        Aparece donde va a estar, sin volar desde un lado: el chico nace en
        el retrato (o en la esquina, con reduced motion). Mientras el Stand
        grande se manifiesta (html.stand-manifest) queda quieto ahi, oculto,
        y al terminar hace su pose: es el grande hecho pequeno. Si la pagina
        se abre ya bajada, si vuela hasta su sitio como siempre.
      */
      const manifesting = document.documentElement.classList.contains("stand-manifest");
      const atStart = reducedMotion || (mode === "home" && perched && !dialog && !(hold && now < holdUntil));
      if ((!placed || manifesting) && atStart) {
        body.x = tx;
        body.y = ty;
        body.vx = 0;
        body.vy = 0;
        placed = true;
      } else if (mode === "out") placed = true;
      if (wasManifesting && !manifesting && !reducedMotion) {
        // Sigue con el cuadro del grande un momento: no se nota el cambio.
        act.current("emerge", 800);
        sfx("ドン!", "sfx");
        // Apenas cae a su tamano: la bienvenida (en la entrada con ZA WARUDO
        // la sustituye la frase del final, ver onIntro).
        if (!introWorld) greet();
      }
      wasManifesting = manifesting;

      // Muelle hacia el destino. Dormido o congelado, no se mueve.
      const distance = Math.hypot(tx - body.x, ty - body.y);
      const held = drag?.moved ?? false;
      const flying = held || !perched || distance > 6;
      const free = now < freeUntil;
      if (held) {
        // Lo lleva el puntero (onDrag).
      } else if (free) {
        // Lanzado: vuela con su impulso, con algo de roce, y rebota en los bordes.
        body.vx *= 1 - 1.6 * dt;
        body.vy = body.vy * (1 - 1.6 * dt) + 900 * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        const spriteHalf = spriteW / 2;
        if (body.x < spriteHalf || body.x > width - spriteHalf) {
          body.x = Math.min(width - spriteHalf, Math.max(spriteHalf, body.x));
          body.vx *= -0.65;
          sfx("ドン", "sfx", 0);
        }
        if (body.y < spriteH + 8 || body.y > height - 4) {
          body.y = Math.min(height - 4, Math.max(spriteH + 8, body.y));
          body.vy *= -0.6;
        }
      } else if (!frozen && !(sleeping && !flying)) {
        // Un viaje nuevo cuando el destino salta; si solo se corre (scroll), lo sigue.
        if (!flight || hopNext || Math.hypot(tx - flight.tx, ty - flight.ty) > 120) {
          flight = newFlight(tx, ty, hopNext);
          hopNext = 0;
        } else {
          flight.tx = tx;
          flight.ty = ty;
        }
        // Avance a lo largo del viaje, sin contar el desvio de la curva
        // (con la distancia total se quedaba flotando a media curva).
        const left = (tx - body.x) * flight.ny - (ty - body.y) * flight.nx;
        const p = Math.min(1, Math.max(0, 1 - left / flight.d0));
        const arc = dialog || reducedMotion ? 0 : flight.amp * Math.sin(Math.PI * p);
        const k = dialog ? 140 : flight.k;
        const c = dialog ? 18 : flight.c;
        const bob = flying ? 3 * Math.sin(now / 160) : 0;
        body.vx += ((tx + flight.nx * arc - body.x) * k - c * body.vx) * dt;
        body.vy += ((ty + flight.ny * arc - body.y + bob) * k - c * body.vy) * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
        // Llego: si fue un saltito, cae con su aplastada.
        if (!flight.landed && distance < 6 && Math.hypot(body.vx, body.vy) < 60) {
          flight.landed = true;
          if (flight.hop) squashUntil = now + 240;
        }
      }
      if (hopLandAt && now > hopLandAt) {
        hopLandAt = 0;
        squashUntil = now + 240;
      }
      const speed = Math.hypot(body.vx, body.vy);
      if (!reducedMotion && !held && speed > 750 && now > nextGhost) {
        nextGhost = now + 45;
        ghost();
      }
      if (Math.abs(body.vx) > 12) body.face = body.vx > 0 ? 1 : -1;
      else if (!flying) {
        // Quieto mira hacia el centro (o, a veces, hacia afuera); con raton cerca, al puntero.
        const near = fine && !dialog && Math.abs(pointerX - body.x) < 320 && Math.abs(pointerY - body.y) < 240;
        body.face = near ? (pointerX > body.x ? 1 : -1) : ((body.x > width / 2 ? -1 : 1) * restFace) as 1 | -1;
      }
      const resting = !flying && !free && speed < 40;

      // Aterrizaje: ドン y, un rato despues, la frase del lugar.
      if (mode === "out" && current && resting && !sleeping && !dialog && now > holdUntil) {
        settledSince ||= now;
        if (!landedHere && !reducedMotion) {
          landedHere = true;
          squashUntil = now + 240;
          if (Math.random() < 0.55) sfx(pickLine(linesRef.current.landing), "sfx");
          // Polvo a los lados al tocar suelo.
          sfx("", "dust", -spriteW * 0.45, -2);
          sfx("", "dust", spriteW * 0.45, -2);
        }
        const recent = now - current.spokeAt < 12000 || now - lastSpokeAt < 4000;
        if (!spokeHere && !recent && now - settledSince > 300) {
          spokeHere = true;
          const line = nextLine(current);
          if (line) {
            say.current(line, 2800);
            current.spokeAt = now;
          }
        }
      }

      // Quieto y despierto: aura de ゴ y, de vez en cuando, una pose.
      if (resting && !sleeping && !dialog && !reducedMotion) {
        if (now > nextAura) {
          nextAura = now + 2400 + Math.random() * 2600;
          sfx("ゴ", "aura");
        }
        if (now > nextFlourish && !action) {
          nextFlourish = now + 7000 + Math.random() * 7000;
          // Un numero distinto cada vez: no siempre la misma pose.
          const skits: [Action, number, string | null][] = [
            ["pose", 1500, "ゴゴゴ"],
            ["pose", 1500, "バァーン"],
            ["happy", 1200, null],
            ["twirl", 700, null],
            ["punch", 1100, "シュッ"],
            ["rush", 900, "ドラララ"],
            ["yawn", 1300, "ふぁ…"],
            ["lookaround", 1800, null],
            ["laugh", 1300, "フフフ"],
            ["wink", 900, "☆"],
            ["think", 1800, "…"],
          ];
          const [kind, ms, word] = skits[Math.floor(Math.random() * skits.length)];
          act.current(kind, ms);
          if (word) sfx(word, kind === "yawn" ? "aura" : "sfx");
        }
        // Se acomoda en la repisa: saltito, un par de pasos o se voltea.
        if (mode === "out" && current && !action && now > nextFidget && now > holdUntil) {
          nextFidget = now + 6000 + Math.random() * 10000;
          const roll = Math.random();
          if (roll < 0.45) {
            pickPerch(current.el.tagName === "H2" && !eyebrowOf(current.el));
            hopNext = 26 + Math.random() * 24;
          } else if (roll < 0.75) {
            body.vy -= 260 + Math.random() * 120;
            hopLandAt = now + 360;
          } else restFace = restFace === 1 ? -1 : 1;
        }
        /*
          Lleva rato callado y hay alguien leyendo. Primero, una vez, avisa
          que se le puede tocar (si nunca abriste su chat). Despues, casi
          siempre una ayuda de la seccion, señalando: que tocar, que
          arrastrar, a donde ir. Si no, piensa en voz alta.
        */
        if (mode === "out" && now - lastSpokeAt > 18000 && now - lastActivity < 5000 && now - settledSince > 2500) {
          const lines = linesRef.current;
          const tips = short(lines.tips[current?.id ?? ""] ?? lines.tips.default ?? []);
          if (!chatted.current && !nudged) {
            nudged = true;
            act.current("pose", 1800, { body: "point", face: "wink" });
            sfx("!", "mark");
            say.current(pickLine(short(lines.nudge)), 3200);
          } else if (tips.length && Math.random() < 0.65) {
            act.current("pose", 1600, { body: "point", face: "happy" });
            say.current(pickLine(tips), 3000);
          } else say.current(pickLine(short(lines.musings)), 2600);
        }
      }
      // Mareado: estrellitas.
      if (action?.kind === "dizzy" && now > nextStar && !reducedMotion) {
        nextStar = now + 260;
        sfx("★", "star", (Math.random() - 0.5) * spriteW);
      }

      // Mirarlo fijo (con raton): reacciona.
      if (fine && !dialog && Math.hypot(pointerX - body.x, pointerY - (body.y - spriteH / 2)) < spriteW * 0.7) {
        stareSince ||= now;
        // Si acaba de hablar (lo sobaste, por ejemplo), mirarlo no lo interrumpe.
        if (now - stareSince > 1500 && now - lastStare > 30000 && now - lastSpokeAt > 4000) {
          lastStare = now;
          react.current("stare");
        }
      } else stareSince = 0;

      // Saluda al salir del retrato si no lo hizo ya al hacerse pequeno.
      if (mode === "out" && !greeted && !held) greet();

      // Cuadro del sprite.
      let frame: Frame = "idle";
      const progress = action ? Math.min(1, (now - action.from) / Math.max(1, action.until - action.from)) : 0;
      // Mientras espera oculto y justo despues del relevo dibuja el mismo
      // cuadro que el Stand grande: el cambio es pixel por pixel.
      const emerging = manifesting || action?.kind === "emerge";
      if (emerging) frame = "stand";
      else if (sleeping) frame = "sleep";
      else if (action?.kind === "dizzy") frame = "dizzy";
      else if (action?.kind === "yawn") frame = "blink";
      else if (action?.kind === "shock" || frozen) frame = "shock";
      else if (action?.kind === "happy") frame = "happy";
      else if (action && FACES.includes(action.kind)) frame = action.kind as Frame;
      else if (action?.kind === "pose") frame = "pose";
      else if (action?.kind === "punch") frame = Math.floor(now / 70) % 2 ? "punch" : "idle";
      else if (action?.kind === "rush") frame = Math.floor(now / 60) % 2 ? "jab" : "jabL";
      else if (now < blinkUntil) frame = "blink";
      // La pose o la cara que se pidio con la accion (una pose JoJo concreta, la risa...).
      const extra: Look | undefined = action?.look && !emerging ? { ...action.look } : undefined;
      const look =
        emerging
          ? 1
          : action?.kind === "lookaround"
          ? Math.round(Math.sin(progress * Math.PI * 3))
          : fine
            ? Math.sign(pointerX - body.x) * body.face
            : 0;
      // Mirada vertical: el puntero arriba de su cabeza o por debajo de sus pies.
      const lookY =
        fine && !emerging && frame !== "think"
          ? pointerY < body.y - spriteH * 1.4
            ? -1
            : pointerY > body.y + spriteH * 0.6
              ? 1
              : 0
          : 0;
      const spin = action?.kind === "twirl" && !frozen ? progress * Math.PI * 2 * body.face : 0;
      const tilt = frozen || spin
        ? 0
        : action?.kind === "dizzy"
            ? Math.sin(now / 90) * 0.3
            : action?.kind === "pose"
              ? (action.look?.body === "high" ? 0.12 : action.look?.body === "point" ? 0.08 : -0.14) * body.face
              : held
                ? Math.sin(now / 70) * 0.18
                : Math.max(-0.35, Math.min(0.35, body.vx / 900));
      const idleBob = !flying && !sleeping && !frozen && !emerging && !reducedMotion ? Math.round(Math.sin(now / 420 + bobPhase[0]) * 0.8 + Math.sin(now / 1130 + bobPhase[1]) * 0.6) * scale * 0.5 : 0;
      /*
        Aplastado al aterrizar (se recupera en 240ms) y un poco estirado al
        volar rapido. En pasos de 0.04 para no redibujar cada cuadro.
      */
      const landing = now < squashUntil ? (squashUntil - now) / 240 : 0;
      const squash = reducedMotion || held || emerging
        ? 0
        : Math.round((landing ? Math.sin(landing * Math.PI) * 0.16 : -Math.min(0.08, speed / 9000)) / 0.04) * 0.04;
      // Riendose tiembla un poco.
      const shakeX = action?.kind === "laugh" && !reducedMotion ? (Math.floor(now / 50) % 2 ? 1 : -1) * Math.max(1, scale / 2) : 0;

      // Solo se redibuja si algo cambio: quieto, el dibujo es el mismo.
      const tail = frozen || sleeping || emerging ? 0 : Math.floor(now / 260) % 2;
      const key = `${idleBob}|${body.face}|${frame}|${tail}|${look}|${lookY}|${extra?.body}|${extra?.face}|${squash}|${shakeX}|${tilt.toFixed(3)}|${spin.toFixed(3)}`;
      if (key !== drawn) {
        drawn = key;
        ctx!.clearRect(0, 0, cw, ch);
        drawStand(ctx!, {
          x: cw / 2 + shakeX,
          y: ch - scale * PAD_BOTTOM + idleBob,
          scale,
          face: body.face,
          frame,
          tail,
          look,
          tilt,
          spin,
          squash,
          extra: { ...extra, lookY: extra?.lookY ?? lookY },
        });
      }
      canvas!.style.transform = `translate3d(${Math.round(body.x - cw / 2)}px, ${Math.round(body.y - ch + scale * PAD_BOTTOM)}px, 0)`;
      button!.style.transform = `translate3d(${Math.round(body.x - spriteW / 2)}px, ${Math.round(body.y - spriteH)}px, 0)`;

      // Globo: escribe y se coloca.
      if (typing.shown < typing.text.length && now >= typing.next) {
        typing.shown += 1;
        typing.next = now + TYPE_MS;
        bubble!.textContent = typing.text.slice(0, typing.shown);
      }
      if (bubbleUntil && now > bubbleUntil) say.current(null);
      if (bubble!.hasAttribute("data-on")) {
        let bx = Math.min(Math.max(12, body.x - bw / 2), width - bw - 12);
        let by = body.y - spriteH - bh - 10;
        let side = "";
        // Sin sitio arriba (debajo del menu): al costado, nunca encima
        // del texto que se esta leyendo.
        if (by < 64) {
          by = body.y - spriteH * 0.8;
          const right = body.x + spriteW / 2 + 10;
          side = right + bw < width - 12 ? "right" : "left";
          bx = side === "right" ? right : Math.max(12, body.x - spriteW / 2 - 10 - bw);
        }
        bubble!.style.transform = `translate3d(${Math.round(bx)}px, ${Math.round(by)}px, 0)`;
        bubble!.style.setProperty("--tail-x", `${Math.round(body.x - bx)}px`);
        if (side) bubble!.setAttribute("data-side", side);
        else bubble!.removeAttribute("data-side");
      }

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    // Desde la consola: stand()
    const w = window as Window & { stand?: () => string };
    w.stand = () => {
      unlockSecret("console");
      activity();
      act.current("pose", 1600);
      say.current(linesRef.current.console, 3000);
      return "ゴゴゴゴ";
    };

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      watcher.disconnect();
      window.clearTimeout(rescan);
      themeWatcher.disconnect();
      seenObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      for (const name of ["pointerdown", "keydown", "wheel", "touchstart"] as const) {
        window.removeEventListener(name, activity);
      }
      document.removeEventListener("click", onClickAnywhere, true);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("scroll", onAnyScroll, true);
      document.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("contextmenu", onContextMenu);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      document.removeEventListener("selectionchange", onSelection);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("beforeprint", onPrint);
      window.clearTimeout(selectTimer);
      window.clearTimeout(greetLater);
      window.removeEventListener("jojo:intro", onIntro);
      document.documentElement.classList.remove("intro-world");
      window.removeEventListener("jojo:timestop", onTimeStop);
      window.removeEventListener("jojo:timestop-attempt", onAttempt);
      button.removeEventListener("pointerdown", onGrab);
      button.removeEventListener("pointermove", onDrag);
      button.removeEventListener("pointerup", onDrop);
      button.removeEventListener("pointercancel", onDrop);
      window.clearTimeout(hesitateTimer);
      window.clearTimeout(resizeTimer);
      spots.forEach((spot) => {
        spot.el.removeEventListener("pointerenter", onEnter);
        spot.el.removeEventListener("pointerleave", onLeave);
      });
      delete w.stand;
    };
  }, [reducedMotion]);

  // Eventos de la pagina (easter eggs, tablero, formularios...).
  useEffect(() => {
    const onEvent = (event: Event) => react.current((event as CustomEvent<StandEvent>).detail);
    window.addEventListener("jojo:event", onEvent);
    return () => window.removeEventListener("jojo:event", onEvent);
  }, []);

  // Cambio de idioma: lo comenta (no en la primera carga).
  const firstLanguage = useRef(true);
  useEffect(() => {
    if (firstLanguage.current) {
      firstLanguage.current = false;
      return;
    }
    react.current("language");
  }, [language]);

  // En el chat gesticula con caras distintas, no siempre la misma.
  const onTalk = useCallback(() => {
    const faces: Action[] = ["happy", "happy", "smug", "starry", "pose", "wink", "laugh", "blush", "think"];
    act.current(faces[Math.floor(Math.random() * faces.length)], 700);
  }, []);

  async function castPower(id: PowerId) {
    setPanel(null);
    // Un poder a la vez: dos efectos encima se pisarian.
    if (casting.current) return;
    casting.current = true;
    const lines = linesRef.current;
    const power = lines.powers[id];
    // Variante distinta cada vez (sin repetir las ultimas).
    const options = POWER_VARIANTS[id];
    const variant = options ? pickFrom(options) : undefined;
    const variantLines = variant ? power.variants?.[variant] : undefined;
    // Lo ultimo que dijo antes de usar el poder (Bites the Dust lo repite).
    const before = saidLog.current.at(-1);
    act.current("pose", 900);
    say.current(pickLine(variantLines?.say ?? power.say), 1600);
    await wait(700);
    const info = probe.current();
    // Giorno tambien golpea para dar vida.
    if (id === "crazydiamond") act.current("rush", 1500);
    else if (id === "starplatinum" || id === "goldexperience") act.current("punch", id === "goldexperience" ? 700 : 1500);
    else if (id === "madeinheaven") act.current("twirl", 2600);

    const found = readSecrets().length;
    const minutes = info.minutes;
    const values = {
      min: `${minutes} min`,
      parts: `${info.seen}/${info.total}`,
      secrets: `${found}/${SECRET_IDS.length}`,
      visits: `#${visitsRef.current}`,
    };
    const photo = {
      title: lines.hermitPhoto.title,
      rows: [
        [lines.hermitPhoto.time, values.min],
        [lines.hermitPhoto.parts, values.parts],
        [lines.hermitPhoto.secrets, values.secrets],
        [lines.hermitPhoto.visits, values.visits],
      ] as [string, string][],
    };
    const done = runPower(id, {
      ...info,
      reducedMotion,
      variant,
      photo,
      universe: lines.universe,
      onStop: () => {
        act.current("pose", 1600);
        say.current(pickLine(lines.universe.stop), 2400);
      },
    });
    if (id === "hermit") {
      const facts = lines.hermit.map((line) =>
        line
          .replace("{min}", values.min)
          .replace("{parts}", String(info.seen))
          .replace("{total}", String(info.total))
          .replace("{secrets}", values.secrets)
          .replace("{visits}", String(visitsRef.current)),
      );
      // Dos de las cosas que "ve", no siempre las mismas.
      for (const fact of [pickLine(facts), pickLine(facts)]) {
        await wait(1500);
        say.current(fact, 1700);
      }
    }
    const perfect = await done.catch(() => false);
    casting.current = false;
    poke.current();
    if (id === "bitesthedust" && before) {
      // Deja vu: repite lo que dijo antes, como si nada.
      act.current("sweat", 2200);
      markRef.current("!?");
      say.current(`${before} ${pickLine(lines.dejaVu)}`, 2800);
      return;
    }
    // King Crimson: el viaje del Stand tambien se borra; ya esta alli.
    if (id === "kingcrimson" && !reducedMotion) blink.current();
    // ZA WARUDO ya se burla al reanudarse (onTimeStop).
    if (id === "zawarudo" && !reducedMotion) return;
    const closing = perfect && power.bonus ? power.bonus : (variantLines?.done ?? power.done);
    if (closing.length) {
      const [face, mark] = perfect ? (["starry", "✦"] as const) : aftermath(id, variant);
      act.current(face, 1800);
      if (mark) markRef.current(mark);
      say.current(pickLine(closing), 2600);
    }
  }

  /** La cara con la que queda despues de cada poder. */
  function aftermath(id: PowerId, variant?: string): readonly [Action, string | null] {
    switch (id) {
      case "starplatinum":
        return variant === "rush" ? ["sweat", "ハァ"] : ["smug", null];
      case "crazydiamond":
        return Math.random() < 0.5 ? ["wink", "✦"] : ["angry", "＃"];
      case "goldexperience":
        return ["starry", "✿"];
      case "echoes":
        return ["happy", "♪"];
      case "softwet":
        return ["sad", "…"];
      case "hermit":
        return ["smug", "フフ"];
      case "madeinheaven":
        return ["sweat", "ハァハァ"];
      case "kingcrimson":
        return ["smug", "!"];
      case "bitesthedust":
        return ["laugh", "フフフ"];
      default:
        return ["happy", null];
    }
  }

  // Reaccion del Stand a cada ronda de un juego (jan-ken, apuesta de almas).
  function reactToRound(result: "win" | "lose" | "draw") {
    // "lose" es que perdiste tu: el Stand se pone engreido.
    if (result === "lose") {
      act.current(Math.random() < 0.5 ? "smug" : "laugh", 1400);
      markRef.current("フフフ");
    } else if (result === "win") {
      act.current(Math.random() < 0.5 ? "angry" : "sad", 1400);
      markRef.current(Math.random() < 0.5 ? "＃" : "…");
    } else {
      act.current(Math.random() < 0.5 ? "sweat" : "think", 900);
      markRef.current("!?");
    }
  }

  // Llevarte a una parte: el Stand avisa y el salto va por el telon de secciones.
  function guide(id: GuideId) {
    setPanel(null);
    act.current("pose", 1200);
    say.current(pickLine(linesRef.current.chat.guide[id].say), 2200);
    window.setTimeout(() => {
      const link = document.createElement("a");
      link.href = `#${id}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    }, 650);
  }

  return (
    <>
      <div className="stand-layer pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <div ref={fxRef} aria-hidden="true" className="absolute inset-0" />
        <canvas ref={canvasRef} aria-hidden="true" className="absolute left-0 top-0 will-change-transform" />
        <p ref={bubbleRef} role="status" className="stand-speech absolute left-0 top-0" />
        <button
          ref={buttonRef}
          type="button"
          aria-label={standLines[language].label}
          aria-haspopup="dialog"
          aria-expanded={panel !== null}
          onClick={() => {
            if (dragged.current) return;
            act.current("happy", 900);
            say.current(null);
            if (!panel) setChats((n) => n + 1);
            setPanel((open) => (open ? null : "chat"));
          }}
          className="stand-hit pointer-events-auto absolute left-0 top-0 cursor-pointer rounded-full"
        />
      </div>
      {panel === "chat" ? (
        <StandChat
          ref={panelRef}
          lines={standLines[language].chat}
          powers={standLines[language].powers}
          onClose={closePanel}
          again={chats > 1}
          onPower={(id) => void castPower(id)}
          onGuide={guide}
          onJanken={() => setPanel("janken")}
          onDarby={() => setPanel("darby")}
          onTalk={onTalk}
        />
      ) : null}
      {panel === "janken" ? (
        <Janken
          ref={panelRef}
          lines={standLines[language].janken}
          onClose={closePanel}
          onRound={reactToRound}
          say={(text, ms) => say.current(text, ms)}
        />
      ) : null}
      {panel === "darby" ? (
        <Darby
          ref={panelRef}
          lines={standLines[language].darby}
          onClose={closePanel}
          onRound={reactToRound}
          say={(text, ms) => say.current(text, ms)}
        />
      ) : null}
    </>
  );
}
