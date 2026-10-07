"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { unlockSecret } from "@/lib/secrets";
import type { StandEvent } from "@/lib/stand-events";
import { drawStand, SPRITE_H, SPRITE_W, type Frame } from "./sprite";
import { standLines, type StandLines } from "./lines";
import { Janken } from "./janken";

/**
 * Mini Stand: Paranoid Android en pixel art, vivo por la pagina.
 *
 * - Vive en el retrato del hero. Al bajar sale volando y se posa encima
 *   de lo que se esta leyendo (elementos con data-spot); con raton, vuela
 *   al que tengas debajo del puntero. Al volver arriba regresa a casa.
 * - En cada lugar dice una frase corta, barajada y sin repetir hasta
 *   agotarlas. Nunca explica los secretos.
 * - 12 s sin que pase nada: se duerme. Cualquier gesto lo despierta.
 * - Reacciona a ZA WARUDO (se congela), a la rafaga del tablero y a los
 *   eggs de teclado (golpea).
 * - Al tocarlo te reta a piedra, papel o tijera (Janken).
 *
 * El dibujo es un canvas pequeno que se mueve con transform; la fisica
 * es un muelle (posicion objetivo, rigidez y amortiguacion), como un
 * pajaro que se acomoda. Con reduced motion no vuela: queda en la
 * esquina y sigue hablando y jugando.
 */

const SLEEP_MS = 12000;
const MOBILE_MAX = 30;

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

/** Frase al azar que no sea la ultima dicha. */
function pickFresh(list: string[], last: string | null) {
  const pool = list.length > 1 ? list.filter((line) => line !== last) : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function MiniStand() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const linesRef = useRef<StandLines>(standLines[language]);

  const [janken, setJanken] = useState(false);
  const jankenRef = useRef<HTMLDivElement | null>(null);
  const jankenOpen = useRef(false);
  // El bucle de animacion lee idioma y juego por ref: no se reinicia.
  useEffect(() => {
    linesRef.current = standLines[language];
    jankenOpen.current = janken;
  }, [language, janken]);

  // Puente hacia el bucle: lo que piden los eventos se encola aqui.
  const say = useRef<(text: string | null, ms?: number) => void>(() => {});
  const act = useRef<(kind: "punch" | "freeze" | "happy" | "shock", ms: number) => void>(() => {});

  const closeJanken = useCallback(() => {
    setJanken(false);
    buttonRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const bubble = bubbleRef.current;
    const button = buttonRef.current;
    if (!canvas || !bubble || !button) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const short = (list: string[]) => (fine ? list : list.filter((line) => line.length <= MOBILE_MAX));

    let width = window.innerWidth;
    let height = window.innerHeight;
    let scale = 3;
    let cw = 0;
    let ch = 0;
    function size() {
      width = window.innerWidth;
      height = window.innerHeight;
      scale = width < 640 ? 2 : 3;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      // Margen para la inclinacion y el contorno.
      cw = (SPRITE_W + 6) * scale;
      ch = (SPRITE_H + 4) * scale;
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
    let sleeping = false;
    let lastActivity = performance.now();
    let action: { kind: "punch" | "freeze" | "happy" | "shock"; until: number } | null = null;
    let bubbleUntil = 0;
    let lastLine: string | null = null;
    let lastSpokeAt = -Infinity;
    let pointerX = width / 2;
    let hovered: Spot | null = null;
    let current: Spot | null = null;
    let candidate: Spot | null = null;
    let candidateSince = 0;
    let settledSince = 0;
    let spokeHere = false;
    let bw = 0;
    let bh = 0;
    let raf = 0;
    let stopped = false;
    let greeted = false;

    say.current = (text, ms = 2800) => {
      if (!text) {
        bubble.removeAttribute("data-on");
        bubbleUntil = 0;
        return;
      }
      lastLine = text;
      lastSpokeAt = performance.now();
      bubble.textContent = text;
      bubble.setAttribute("data-on", "");
      bw = bubble.offsetWidth;
      bh = bubble.offsetHeight;
      bubbleUntil = ms === Infinity ? Infinity : performance.now() + ms;
    };
    act.current = (kind, ms) => {
      action = { kind, until: performance.now() + ms };
    };

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
    const watcher = new MutationObserver(() => {
      for (let i = spots.length - 1; i >= 0; i--) if (!spots[i].el.isConnected) spots.splice(i, 1);
      document.querySelectorAll("[data-spot]").forEach(track);
    });
    watcher.observe(document.body, { childList: true, subtree: true });

    /*
      Un titulo ocupa todo el ancho aunque su texto sea corto: se mide el
      texto (Range), para posarse al final de la palabra y no en el aire.
    */
    const range = document.createRange();
    function spotRect(spot: Spot) {
      if (spot.el.tagName !== "H2") return spot.el.getBoundingClientRect();
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

    // --- Actividad y sueno --------------------------------------------
    function activity() {
      lastActivity = performance.now();
      if (sleeping) {
        sleeping = false;
        say.current(pickFresh(short(linesRef.current.wake), lastLine), 2200);
      }
    }
    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      activity();
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    for (const name of ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const) {
      window.addEventListener(name, activity, { passive: true });
    }
    window.addEventListener("resize", size);

    // --- Bucle --------------------------------------------------------
    function home() {
      return document.querySelector("[data-stand-home]");
    }
    function hero() {
      return document.querySelector("[data-stand-hero]");
    }

    function tick(now: number) {
      if (stopped) return;
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
      if (!sleeping && !jankenOpen.current && now - lastActivity > SLEEP_MS) {
        sleeping = true;
        say.current(linesRef.current.sleep, Infinity);
        unlockSecret("sleep");
      }

      // Destino.
      const heroRect = hero()?.getBoundingClientRect();
      if (mode === "home" && heroRect && heroRect.bottom < height * 0.45) mode = "out";
      else if (mode === "out" && heroRect && heroRect.bottom > height * 0.6) {
        mode = "home";
        current = null;
        say.current(null);
      }

      let tx: number;
      let ty: number;
      let perched = false;

      const dialog = jankenOpen.current ? jankenRef.current : null;
      if (reducedMotion) {
        tx = width - spriteW / 2 - 16;
        ty = height - 16;
      } else if (dialog) {
        const rect = dialog.getBoundingClientRect();
        tx = rect.right - spriteW;
        ty = rect.top - 1;
        perched = true;
      } else if (mode === "home") {
        const rect = home()?.getBoundingClientRect();
        if (rect) {
          tx = rect.right - spriteW * 0.25;
          ty = rect.top + spriteH * 0.35;
          perched = true;
        } else {
          tx = width - spriteW;
          ty = height * 0.35;
        }
      } else {
        // El lugar que se esta leyendo: el mas cercano al tercio superior.
        let best: Spot | null = null;
        if (hovered) best = hovered;
        else {
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
        }
        // Cambia de lugar solo si el nuevo se sostiene 450 ms: sin
        // nervios al pasar rapido.
        if (best !== candidate) {
          candidate = best;
          candidateSince = now;
        }
        if (candidate !== current && now - candidateSince > 450) {
          current = candidate;
          spokeHere = false;
          settledSince = 0;
          if (!sleeping) say.current(null);
        }
        if (current) {
          const rect = spotRect(current);
          tx = Math.min(rect.right - spriteW * 0.6, Math.max(rect.left + spriteW * 0.6, rect.right - spriteW * 1.6));
          ty = Math.max(70, rect.top - 1);
          perched = true;
        } else {
          tx = width - spriteW - 24;
          ty = height * 0.38;
        }
      }

      // Muelle hacia el destino. Dormido o congelado, no se mueve.
      const distance = Math.hypot(tx - body.x, ty - body.y);
      const flying = !perched || distance > 6;
      if (!frozen && !(sleeping && !flying)) {
        const k = dialog ? 140 : 60;
        const c = dialog ? 18 : 11;
        const bob = flying ? 3 * Math.sin(now / 160) : 0;
        body.vx += ((tx - body.x) * k - c * body.vx) * dt;
        body.vy += ((ty - body.y + bob) * k - c * body.vy) * dt;
        body.x += body.vx * dt;
        body.y += body.vy * dt;
      }
      if (Math.abs(body.vx) > 12) body.face = body.vx > 0 ? 1 : -1;
      else if (!flying) body.face = body.x > width / 2 ? -1 : 1;

      // Frase al llegar.
      if (mode === "out" && current && !flying && Math.hypot(body.vx, body.vy) < 40 && !sleeping && !dialog) {
        settledSince ||= now;
        const recent = now - current.spokeAt < 12000 || now - lastSpokeAt < 4000;
        if (!spokeHere && !recent && now - settledSince > 250) {
          spokeHere = true;
          const line = nextLine(current);
          if (line) {
            say.current(line, 2800);
            current.spokeAt = now;
          }
        }
      }
      if (mode === "out" && !greeted) {
        greeted = true;
        const hour = new Date().getHours();
        if (hour < 5) {
          say.current(linesRef.current.night, 3200);
          unlockSecret("night");
        }
      }

      // Cuadro del sprite.
      let frame: Frame = "idle";
      if (sleeping) frame = "sleep";
      else if (action?.kind === "shock" || frozen) frame = "shock";
      else if (action?.kind === "happy") frame = "happy";
      else if (action?.kind === "punch") frame = Math.floor(now / 70) % 2 ? "punch" : "idle";
      else if (now < blinkUntil) frame = "blink";
      const look = fine ? Math.sign(pointerX - body.x) * body.face : 0;
      const tilt = frozen ? 0 : Math.max(-0.35, Math.min(0.35, body.vx / 900));
      const idleBob = !flying && !sleeping && !frozen && !reducedMotion ? Math.round(Math.sin(now / 420) * 1.2) * scale * 0.5 : 0;

      ctx!.clearRect(0, 0, cw, ch);
      const dark = document.documentElement.classList.contains("dark");
      drawStand(ctx!, {
        x: cw / 2,
        y: ch - scale * 2 + idleBob,
        scale,
        face: body.face,
        frame,
        tail: frozen || sleeping ? 0 : Math.floor(now / 260) % 2,
        look,
        tilt,
        rim: dark ? "#060507" : "#161418",
      });
      canvas!.style.transform = `translate3d(${Math.round(body.x - cw / 2)}px, ${Math.round(body.y - ch + scale * 2)}px, 0)`;
      button!.style.transform = `translate3d(${Math.round(body.x - spriteW / 2)}px, ${Math.round(body.y - spriteH)}px, 0)`;

      // Globo encima, sin salirse de la pantalla.
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
      act.current("happy", 1600);
      say.current(linesRef.current.console, 3000);
      return "ゴゴゴゴ";
    };

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      watcher.disconnect();
      window.removeEventListener("pointermove", onPointer);
      for (const name of ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const) {
        window.removeEventListener(name, activity);
      }
      window.removeEventListener("resize", size);
      spots.forEach((spot) => {
        spot.el.removeEventListener("pointerenter", onEnter);
        spot.el.removeEventListener("pointerleave", onLeave);
      });
      delete w.stand;
    };
  }, [reducedMotion]);

  // Reacciones a lo que pasa en la pagina.
  useEffect(() => {
    let last: string | null = null;
    function onEvent(event: Event) {
      const kind = (event as CustomEvent<StandEvent>).detail;
      const line = pickFresh(linesRef.current.events[kind], last);
      last = line;
      if (kind === "timestop") act.current("freeze", 3000);
      else if (kind === "ora" || kind === "barrage") act.current("punch", 900);
      else if (kind === "muda" || kind === "arrow") act.current("shock", 1400);
      else act.current("happy", 1600);
      say.current(line, 2600);
    }
    window.addEventListener("jojo:event", onEvent);
    return () => window.removeEventListener("jojo:event", onEvent);
  }, []);

  return (
    <>
      <div className="stand-layer pointer-events-none fixed inset-0 z-40 overflow-hidden">
        <canvas ref={canvasRef} aria-hidden="true" className="absolute left-0 top-0 will-change-transform" />
        <p ref={bubbleRef} role="status" className="stand-speech absolute left-0 top-0" />
        <button
          ref={buttonRef}
          type="button"
          aria-label={standLines[language].label}
          aria-haspopup="dialog"
          aria-expanded={janken}
          onClick={() => {
            act.current("happy", 900);
            setJanken((open) => !open);
          }}
          className="stand-hit pointer-events-auto absolute left-0 top-0 cursor-pointer rounded-full"
        />
      </div>
      {janken ? (
        <Janken
          ref={jankenRef}
          lines={standLines[language].janken}
          onClose={closeJanken}
          onRound={(result) => {
            if (result === "lose") act.current("happy", 1200);
            else if (result === "win") act.current("shock", 1200);
            else act.current("punch", 500);
          }}
          say={(text, ms) => say.current(text, ms)}
        />
      ) : null}
    </>
  );
}
