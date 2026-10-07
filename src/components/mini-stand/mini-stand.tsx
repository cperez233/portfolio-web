"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { readSecrets, SECRET_IDS, unlockSecret } from "@/lib/secrets";
import type { StandEvent } from "@/lib/stand-events";
import { drawStand, SPRITE_H, SPRITE_W, type Frame } from "./sprite";
import { standLines, type PowerId, type StandLines } from "./lines";
import { Janken } from "./janken";
import { StandChat } from "./stand-chat";
import { runPower } from "./powers";

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
 * - Reacciona a lo que haces: cambiar tema o idioma, tocar WhatsApp,
 *   copiar, volver a la pestana, bajar demasiado rapido, mirarlo fijo,
 *   enviar el formulario, llegar al final, y a los easter eggs.
 * - 12 s sin que pase nada: se duerme.
 * - Al tocarlo abre una conversacion: quien es, que hace el, un poder
 *   prestado (ZA WARUDO, Crazy Diamond, Echoes, Hermit Purple, Bites the
 *   Dust, King Crimson) o un jan-ken.
 *
 * El dibujo es un canvas pequeno movido con transform; la fisica es un
 * muelle hacia el destino. Con reduced motion no vuela: queda en la
 * esquina, habla y juega.
 */

const SLEEP_MS = 12000;
const MOBILE_MAX = 30;
const TYPE_MS = 22;

type Action = "punch" | "freeze" | "happy" | "shock" | "pose";

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

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

export function MiniStand() {
  const { language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bubbleRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fxRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<StandLines>(standLines[language]);

  const [panel, setPanel] = useState<"chat" | "janken" | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const panelOpen = useRef(false);
  useEffect(() => {
    linesRef.current = standLines[language];
    panelOpen.current = panel !== null;
  }, [language, panel]);

  // Puentes hacia el bucle de animacion.
  const say = useRef<(text: string | null, ms?: number) => void>(() => {});
  const act = useRef<(kind: Action, ms: number) => void>(() => {});
  const react = useRef<(kind: StandEvent, ms?: number) => void>(() => {});
  const probe = useRef(() => ({ x: 0, y: 0, target: null as Element | null, pastScroll: 0, seen: 0, total: 0 }));

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
    function size() {
      width = window.innerWidth;
      height = window.innerHeight;
      scale = width < 640 ? 2 : 3;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
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
    let nextFlourish = performance.now() + 6000;
    let nextAura = performance.now() + 3000;
    let sleeping = false;
    let lastActivity = performance.now();
    let action: { kind: Action; until: number } | null = null;
    let lastLine: string | null = null;
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
    let saidBottom = false;
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
      lastLine = text;
      lastSpokeAt = performance.now();
      bubble.style.width = "";
      bubble.textContent = text;
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
    act.current = (kind, ms) => {
      action = { kind, until: performance.now() + ms };
    };

    // Onomatopeyas y aura: un pequeno grupo de elementos reutilizables.
    function sfx(text: string, kind: "sfx" | "aura") {
      const node = document.createElement("span");
      node.className = kind === "sfx" ? "stand-sfx" : "stand-aura";
      node.textContent = text;
      const dx = kind === "sfx" ? (body.face > 0 ? -28 : 28) : (Math.random() - 0.5) * 30;
      node.style.transform = `translate3d(${Math.round(body.x + dx)}px, ${Math.round(body.y - SPRITE_H * scale * 0.9)}px, 0)`;
      fx!.appendChild(node);
      window.setTimeout(() => node.remove(), kind === "sfx" ? 900 : 2200);
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
    const watcher = new MutationObserver(() => {
      for (let i = spots.length - 1; i >= 0; i--) if (!spots[i].el.isConnected) spots.splice(i, 1);
      document.querySelectorAll("[data-spot]").forEach(track);
    });
    watcher.observe(document.body, { childList: true, subtree: true });

    // Un titulo ocupa todo el ancho: se mide su texto para posarse al final.
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
        target: current?.el ?? null,
        pastScroll: past.y,
        seen: seen.size,
        total: sectionEls.length,
      };
    };

    // --- Reacciones a lo que pasa ---------------------------------------
    const lastReaction: Partial<Record<StandEvent, number>> = {};
    react.current = (kind, ms = 2600) => {
      const now = performance.now();
      // Las reacciones de ambiente no se repiten seguido.
      const ambient = ["copy", "fastScroll", "stare", "return", "language"].includes(kind);
      if (ambient && now - (lastReaction[kind] ?? -Infinity) < 25000) return;
      lastReaction[kind] = now;
      if (sleeping) {
        sleeping = false;
        lastActivity = now;
      }
      const line = pickFresh(short(linesRef.current.events[kind]), lastLine);
      if (kind === "timestop") act.current("freeze", 3000);
      else if (kind === "ora" || kind === "barrage") act.current("punch", 900);
      else if (kind === "muda" || kind === "arrow" || kind === "fastScroll" || kind === "themeLight") act.current("shock", 1400);
      else if (kind === "whatsapp" || kind === "sent" || kind === "bottom") {
        act.current("pose", 1500);
        sfx("ドン!", "sfx");
      } else act.current("happy", 1400);
      say.current(line, ms);
    };

    // --- Actividad, sueno y gestos ---------------------------------------
    function activity() {
      lastActivity = performance.now();
      if (sleeping) {
        sleeping = false;
        say.current(pickFresh(short(linesRef.current.wake), lastLine), 2200);
      }
    }
    const onPointer = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      activity();
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
      const link = (event.target as Element | null)?.closest?.("a[href*='wa.me']");
      if (link) react.current("whatsapp");
    };
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
    window.addEventListener("resize", size);

    // --- Bucle --------------------------------------------------------
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
      if (!sleeping && !panelOpen.current && now - lastActivity > SLEEP_MS) {
        sleeping = true;
        say.current(linesRef.current.sleep, Infinity);
        unlockSecret("sleep");
      }

      // Destino.
      const heroRect = document.querySelector("[data-stand-hero]")?.getBoundingClientRect();
      if (mode === "home" && heroRect && heroRect.bottom < height * 0.45) mode = "out";
      else if (mode === "out" && heroRect && heroRect.bottom > height * 0.6) {
        mode = "home";
        current = null;
        say.current(null);
      }

      let tx: number;
      let ty: number;
      let perched = false;
      const dialog = panelOpen.current ? panelRef.current : null;
      if (reducedMotion) {
        tx = width - spriteW / 2 - 16;
        ty = height - 16;
      } else if (dialog) {
        const rect = dialog.getBoundingClientRect();
        tx = rect.right - spriteW;
        ty = rect.top - 1;
        perched = true;
      } else if (mode === "home") {
        const rect = document.querySelector("[data-stand-home]")?.getBoundingClientRect();
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
        if (best !== candidate) {
          candidate = best;
          candidateSince = now;
        }
        if (candidate !== current && now - candidateSince > 450) {
          current = candidate;
          spokeHere = false;
          landedHere = false;
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
      const resting = !flying && Math.hypot(body.vx, body.vy) < 40;

      // Aterrizaje: ドン y, un rato despues, la frase del lugar.
      if (mode === "out" && current && resting && !sleeping && !dialog) {
        settledSince ||= now;
        if (!landedHere && !reducedMotion) {
          landedHere = true;
          if (Math.random() < 0.55) sfx(pickFresh(linesRef.current.landing, null), "sfx");
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
          nextFlourish = now + 8000 + Math.random() * 7000;
          act.current(Math.random() < 0.6 ? "pose" : "happy", 1300);
        }
      }

      // Mirarlo fijo (con raton): reacciona.
      if (fine && !dialog && Math.hypot(pointerX - body.x, pointerY - (body.y - spriteH / 2)) < spriteW * 0.7) {
        stareSince ||= now;
        if (now - stareSince > 1500 && now - lastStare > 30000) {
          lastStare = now;
          react.current("stare");
        }
      } else stareSince = 0;

      if (mode === "out" && !greeted) {
        greeted = true;
        if (new Date().getHours() < 5) {
          say.current(linesRef.current.night, 3200);
          unlockSecret("night");
        }
      }

      // Cuadro del sprite.
      let frame: Frame = "idle";
      if (sleeping) frame = "sleep";
      else if (action?.kind === "shock" || frozen) frame = "shock";
      else if (action?.kind === "happy") frame = "happy";
      else if (action?.kind === "pose") frame = "pose";
      else if (action?.kind === "punch") frame = Math.floor(now / 70) % 2 ? "punch" : "idle";
      else if (now < blinkUntil) frame = "blink";
      const look = fine ? Math.sign(pointerX - body.x) * body.face : 0;
      const tilt = frozen
        ? 0
        : action?.kind === "pose"
          ? -0.14 * body.face
          : Math.max(-0.35, Math.min(0.35, body.vx / 900));
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
      window.removeEventListener("resize", size);
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

  const onTalk = useCallback(() => act.current("happy", 500), []);

  async function castPower(id: PowerId) {
    setPanel(null);
    const lines = linesRef.current;
    const power = lines.powers[id];
    act.current("pose", 900);
    say.current(pickFresh(power.say, null), 1600);
    await wait(700);
    const info = probe.current();
    const done = runPower(id, { ...info, reducedMotion });
    if (id === "hermit") {
      const found = readSecrets().length;
      const minutes = Math.max(1, Math.round(performance.now() / 60000));
      const facts = lines.hermit.map((line) =>
        line
          .replace("{min}", `${minutes} min`)
          .replace("{parts}", String(info.seen))
          .replace("{total}", String(info.total))
          .replace("{secrets}", `${found}/${SECRET_IDS.length}`),
      );
      for (const fact of facts) {
        await wait(900);
        say.current(fact, 1700);
      }
    }
    await done;
    if (power.done.length) {
      act.current("happy", 1200);
      say.current(pickFresh(power.done, null), 2600);
    }
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
            act.current("happy", 900);
            say.current(null);
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
          onPower={(id) => void castPower(id)}
          onJanken={() => setPanel("janken")}
          onTalk={onTalk}
        />
      ) : null}
      {panel === "janken" ? (
        <Janken
          ref={panelRef}
          lines={standLines[language].janken}
          onClose={closePanel}
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
