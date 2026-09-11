"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { dictionaries, type Dictionary, type Language } from "@/data/content";
import {
  DETECTED_LANGUAGE_COOKIE,
  LANGUAGE_COOKIE,
  isLanguage,
} from "@/lib/language-detection";

/** Un ano: la eleccion manual es una preferencia duradera. */
const MANUAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/*
  Store minimo fuera de React, leido con useSyncExternalStore.

  localStorage y las cookies no se leen durante el render del servidor,
  asi que leerlos ahi romperia la hidratacion. useSyncExternalStore
  resuelve justo eso: `getServerSnapshot` fija "en" para el HTML del
  servidor y la primera hidratacion, y solo despues React pasa a
  `getSnapshot`. Sin efectos que llamen a setState, sin aviso de
  hidratacion.
*/
let currentLanguage: Language | null = null;
let listeners: Array<() => void> = [];
/*
  Si el ultimo cambio lo hizo el usuario con el toggle. El primero, al
  hidratar, pasa del "en" del HTML estatico al idioma detectado: ese no
  debe animarse (ver `crossfade`).
*/
let userSwitched = false;

function readCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/*
  Prioridad (ver lib/language-detection.ts): eleccion manual, idioma
  detectado por el proxy, idioma del navegador, ingles. localStorage se
  sigue leyendo como eleccion manual: es donde se guardaba antes de que
  existiera la cookie.
*/
function resolveLanguage(): Language {
  try {
    const manual =
      readCookie(LANGUAGE_COOKIE) ?? window.localStorage.getItem(LANGUAGE_COOKIE);
    if (isLanguage(manual)) return manual;

    const detected = readCookie(DETECTED_LANGUAGE_COOKIE);
    if (isLanguage(detected)) return detected;
  } catch {
    // Modo privado o almacenamiento bloqueado: se sigue con el navegador.
  }

  return navigator.language?.toLowerCase().startsWith("es") ? "es" : "en";
}

function getSnapshot(): Language {
  if (currentLanguage === null) {
    currentLanguage = resolveLanguage();
  }
  return currentLanguage;
}

function getServerSnapshot(): Language {
  return "en";
}

function subscribe(onStoreChange: () => void) {
  listeners = [...listeners, onStoreChange];
  return () => {
    listeners = listeners.filter((listener) => listener !== onStoreChange);
  };
}

/**
 * Eleccion manual del toggle: se guarda en cookie (la ve el proxy, que
 * entonces deja de detectar) y en localStorage.
 */
function writeLanguage(next: Language) {
  currentLanguage = next;
  userSwitched = true;
  try {
    document.cookie = `${LANGUAGE_COOKIE}=${next}; Path=/; Max-Age=${MANUAL_COOKIE_MAX_AGE}; SameSite=Lax`;
    window.localStorage.setItem(LANGUAGE_COOKIE, next);
  } catch {
    // La preferencia no sobrevive a la recarga, pero la sesion funciona.
  }
  listeners.forEach((listener) => listener());
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  /** Diccionario ya resuelto para el idioma activo. */
  t: Dictionary;
  /**
   * Si el cambio de idioma debe animarse. Solo tras usar el toggle. El
   * ajuste inicial al idioma detectado se aplica en el sitio: con fundido,
   * FadeSwap mantenia unos segundos el bloque anterior, y el enlace de
   * WhatsApp del hero seguia en ingles sobre una pagina ya en espanol.
   */
  crossfade: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setLanguage = useCallback((next: Language) => writeLanguage(next), []);
  const toggleLanguage = useCallback(() => {
    writeLanguage(getSnapshot() === "en" ? "es" : "en");
  }, []);

  /*
    El atributo `lang` de <html> tiene que seguir al idioma elegido. Se
    sirve como "en" desde el servidor, y sin esto se quedaba asi para
    siempre: un lector de pantalla leia todo el sitio en espanol con
    reglas foneticas inglesas.
  */
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t: dictionaries[language],
      crossfade: userSwitched,
    }),
    [language, setLanguage, toggleLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
}
