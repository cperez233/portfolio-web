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

const STORAGE_KEY = "portafolio-language";

/*
  Store minimo fuera de React, leido con useSyncExternalStore.

  localStorage no existe en el servidor, asi que leerlo durante el render
  romperia la hidratacion. useSyncExternalStore resuelve justo eso:
  `getServerSnapshot` fija "en" para el HTML del servidor y la primera
  hidratacion, y solo despues React pasa a `getSnapshot`. Sin efectos que
  llamen a setState, sin aviso de hidratacion.
*/
let currentLanguage: Language | null = null;
let listeners: Array<() => void> = [];

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "es" || stored === "en" ? stored : "en";
  } catch {
    // Modo privado o cookies bloqueadas: el idioma por defecto sirve igual.
    return "en";
  }
}

function getSnapshot(): Language {
  if (currentLanguage === null) {
    currentLanguage = readStoredLanguage();
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

function writeLanguage(next: Language) {
  currentLanguage = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
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
