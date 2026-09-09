"use client";

import { useCallback, useSyncExternalStore } from "react";
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

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    writeTheme(getSnapshot() === "dark" ? "light" : "dark");
  }, []);

  return { theme, isDark: theme === "dark", toggleTheme };
}
