"use client";

import { useCallback, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type Theme,
} from "@/lib/theme-storage";

/*
  Mismo patron que `language.tsx`: un store minimo fuera de React leido
  con useSyncExternalStore.

  La diferencia es donde vive la verdad. El idioma solo existe en
  localStorage; el tema vive en la clase `.dark` de <html>, porque el
  script de `layout.tsx` ya la ha puesto antes de la primera pintura.
  Leer de ahi evita que el store y el DOM puedan discrepar.
*/
let listeners: Array<() => void> = [];

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return DEFAULT_THEME;
}

function subscribe(onStoreChange: () => void) {
  listeners = [...listeners, onStoreChange];
  return () => {
    listeners = listeners.filter((listener) => listener !== onStoreChange);
  };
}

function writeTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // Modo privado: la preferencia no sobrevive a la recarga, pero la
    // sesion funciona igual.
  }
  listeners.forEach((listener) => listener());
}

/** Duracion del cambio de tema con trama; igual que en globals.css. */
const TONE_MS = 900;
/** Cambio en curso: el temporizador de seguridad de uno viejo no toca al nuevo. */
let toneRun = 0;

/*
  El cambio de tema como una trama de manga (screentone): el tema nuevo
  entra desde el boton en una onda de puntos que crecen hasta fundirse,
  con el centro ya solido. Usa View Transitions del mismo documento: el
  navegador fotografia la pagina vieja, se aplica el tema y la nueva se
  revela con la mascara de globals.css (html.theme-tone).

  Mientras dura se apagan las transiciones de color de los componentes:
  si no, la pagina nueva haria ademas su propio fundido debajo de la
  mascara y se veria el tema viejo asomando entre los puntos. Sin View
  Transitions o con reduced motion, el cambio es el de siempre.
*/
function toggleWithTone(next: Theme, origin?: Element | null) {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!origin || reduced || typeof document.startViewTransition !== "function") {
    writeTheme(next);
    return;
  }
  const box = origin.getBoundingClientRect();
  const x = box.left + box.width / 2;
  const y = box.top + box.height / 2;
  const reach = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  root.style.setProperty("--tone-x", `${x}px`);
  root.style.setProperty("--tone-y", `${y}px`);
  root.style.setProperty("--tone-reach", `${Math.ceil(reach)}px`);
  root.classList.add("theme-tone");
  let transition: ViewTransition;
  try {
    // flushSync: el icono del boton tiene que estar ya cambiado en la foto nueva.
    transition = document.startViewTransition(() => flushSync(() => writeTheme(next)));
  } catch {
    root.classList.remove("theme-tone");
    writeTheme(next);
    return;
  }
  const run = ++toneRun;
  const done = () => {
    if (run === toneRun) root.classList.remove("theme-tone");
  };
  transition.finished.then(done, done);
  // Red de seguridad: si la transicion se queda colgada, la clase no se queda puesta.
  window.setTimeout(done, TONE_MS + 600);
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  /** `origin`: el boton pulsado, de donde nace la trama. */
  const toggleTheme = useCallback((origin?: Element | null) => {
    toggleWithTone(getSnapshot() === "dark" ? "light" : "dark", origin);
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}
