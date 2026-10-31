/**
 * El tiempo detenido de toda la pagina (ZA WARUDO).
 *
 * Mientras dura nadie se mueve, tampoco quien visita: el scroll, la rueda,
 * el tacto, las teclas de desplazamiento y los clics quedan bloqueados;
 * las animaciones CSS y de la Web Animations API se pausan, los videos se
 * detienen y las escenas 3D dejan de avanzar (consultan isTimeStopped()).
 *
 * El mini Stand tambien queda congelado; escucha "jojo:timestop" para
 * saber quien lo detuvo: si fue el (ZA WARUDO), al reanudarse ya esta en
 * otro sitio. Cada intento de moverse emite "jojo:timestop-attempt" (se
 * burla despues).
 *
 * Lo usan el toque en el retrato del hero y el poder ZA WARUDO.
 */

export interface TimeStopDetail {
  active: boolean;
  /** Duracion total, en ms. */
  ms: number;
  /**
   * Quien lo detuvo: "page" (el toque del retrato), "stand" (ZA WARUDO del
   * mini Stand) o "platinum" (Star Platinum: The World; al reanudarse el
   * Stand aparece junto a su blanco, con la rafaga ya hecha).
   */
  by: "page" | "stand" | "platinum";
  /** Star Platinum: el blanco de la rafaga; al reanudarse el Stand ya esta junto a el. */
  target?: Element;
}

let stopped = false;
let lastAttempt = 0;
/** Reanuda ya el tiempo detenido en curso (ver endTimeStop). */
let resumeNow: (() => void) | null = null;

export function isTimeStopped() {
  return stopped;
}

const SCROLL_KEYS = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", "Tab", "Enter"]);

/** Detiene el tiempo `ms` milisegundos. Devuelve una promesa que se cumple al reanudarse. */
export function stopTime(ms: number, by: TimeStopDetail["by"] = "page", target?: Element): Promise<void> {
  if (typeof window === "undefined" || stopped) return Promise.resolve();
  stopped = true;
  const root = document.documentElement;
  root.classList.add("time-stopped");
  window.__lenis?.stop();

  // Lo que estaba corriendo se pausa y solo eso se reanuda.
  const paused = document.getAnimations().filter((animation) => animation.playState === "running");
  paused.forEach((animation) => animation.pause());
  const videos = [...document.querySelectorAll("video")].filter((video) => !video.paused);
  videos.forEach((video) => video.pause());

  const attempt = () => {
    const now = performance.now();
    if (now - lastAttempt < 700) return;
    lastAttempt = now;
    window.dispatchEvent(new CustomEvent("jojo:timestop-attempt"));
  };
  const block = (event: Event) => {
    if (event instanceof KeyboardEvent && !SCROLL_KEYS.has(event.key)) return;
    // Lo que sigue funcionando con el tiempo detenido (el boton de saltar la entrada).
    if (event.target instanceof Element && event.target.closest("[data-time-free]")) return;
    event.preventDefault();
    event.stopPropagation();
    attempt();
  };
  const options = { capture: true, passive: false } as const;
  const kinds = ["wheel", "touchmove", "keydown", "click", "pointerdown", "mousedown"] as const;
  kinds.forEach((kind) => window.addEventListener(kind, block, options));
  // Por si el navegador desplaza igual (barra de scroll): se devuelve al sitio.
  const y = window.scrollY;
  const pin = () => window.scrollY !== y && window.scrollTo(0, y);
  window.addEventListener("scroll", pin);

  window.dispatchEvent(new CustomEvent<TimeStopDetail>("jojo:timestop", { detail: { active: true, ms, by, target } }));

  return new Promise((resolve) => {
    const resume = () => {
      if (resumeNow !== early) return;
      resumeNow = null;
      window.clearTimeout(timer);
      kinds.forEach((kind) => window.removeEventListener(kind, block, options));
      window.removeEventListener("scroll", pin);
      root.classList.remove("time-stopped");
      paused.forEach((animation) => {
        if (animation.playState === "paused") animation.play();
      });
      videos.forEach((video) => void video.play().catch(() => {}));
      window.__lenis?.start();
      stopped = false;
      window.dispatchEvent(new CustomEvent<TimeStopDetail>("jojo:timestop", { detail: { active: false, ms, by, target } }));
      resolve();
    };
    const early = () => resume();
    resumeNow = early;
    const timer = window.setTimeout(resume, ms);
  });
}

/** Reanuda el tiempo ahora, si esta detenido (saltar la entrada con ZA WARUDO). */
export function endTimeStop() {
  resumeNow?.();
}

const HOLD_KEYS = new Set([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"]);

/**
 * Fija el scroll sin detener el tiempo: la pagina sigue animando y se puede
 * tocar todo (el boton de saltar, el menu, Tab), solo que no se desplaza.
 * Lo usa Crazy Diamond: sus grietas son del vidrio de la pantalla, y al bajar
 * se quedaban sobre otra seccion. `maxMs` lo suelta pase lo que pase: nadie
 * se queda sin poder bajar. Devuelve como soltarlo antes.
 */
export function holdScroll(maxMs: number) {
  const y = window.scrollY;
  window.__lenis?.stop();
  const block = (event: Event) => {
    if (event instanceof KeyboardEvent) {
      if (!HOLD_KEYS.has(event.key)) return;
      // La barra espaciadora tambien aprieta botones.
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select")) return;
    }
    event.preventDefault();
  };
  const options = { capture: true, passive: false } as const;
  const kinds = ["wheel", "touchmove", "keydown"] as const;
  kinds.forEach((kind) => window.addEventListener(kind, block, options));
  // Por si el navegador desplaza igual (barra de scroll): se devuelve al sitio.
  const pin = () => window.scrollY !== y && window.scrollTo(0, y);
  window.addEventListener("scroll", pin);
  let held = true;
  const release = () => {
    if (!held) return;
    held = false;
    window.clearTimeout(timer);
    kinds.forEach((kind) => window.removeEventListener(kind, block, options));
    window.removeEventListener("scroll", pin);
    window.__lenis?.start();
  };
  const timer = window.setTimeout(release, maxMs);
  return release;
}
