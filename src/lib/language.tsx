"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { dictionaries, type Dictionary, type Language } from "@/data/content";
import { LANGUAGE_COOKIE, LANGUAGE_PATHS } from "@/lib/language-detection";

/** Un ano: la eleccion manual es una preferencia duradera. */
const MANUAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/*
  El idioma sale de la URL: "/" es ingles y "/es" espanol, y cada una se
  renderiza en el servidor en su idioma. Antes habia una sola URL que el
  servidor pintaba siempre en ingles y el cliente pasaba a espanol, asi
  que Google nunca vio una palabra en espanol.

  La deteccion (Accept-Language, pais) vive ahora solo en proxy.ts, que
  redirige "/" a "/es" cuando toca. Aqui no se adivina nada: el estado
  inicial es el de la ruta, y servidor y cliente coinciden al hidratar.
*/

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  /** Diccionario ya resuelto para el idioma activo. */
  t: Dictionary;
  /** Si el cambio de idioma debe animarse: solo tras usar el toggle. */
  crossfade: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  initialLanguage,
  children,
}: {
  initialLanguage: Language;
  children: React.ReactNode;
}) {
  const [language, setLanguageState] = useState(initialLanguage);
  const [crossfade, setCrossfade] = useState(false);

  /*
    El toggle cambia el idioma en el sitio, con el fundido de FadeSwap, y
    deja la URL en la version equivalente con replaceState: sin recargar,
    sin perder el scroll, y con una direccion que se puede compartir.

    La cookie la lee proxy.ts: quien elige ingles a mano no vuelve a ser
    redirigido a /es por venir de Colombia.
  */
  const setLanguage = useCallback((next: Language) => {
    setCrossfade(true);
    setLanguageState(next);
    try {
      document.cookie = `${LANGUAGE_COOKIE}=${next}; Path=/; Max-Age=${MANUAL_COOKIE_MAX_AGE}; SameSite=Lax`;
    } catch {
      // Sin cookie la preferencia no sobrevive a la recarga; la sesion si.
    }
  }, []);

  /*
    Lo que el servidor no puede cambiar tras un cambio en el cliente: el
    `lang` de <html>, el titulo de la pestana y la URL.
  */
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = dictionaries[language].meta.title;
    const path = LANGUAGE_PATHS[language];
    if (window.location.pathname !== path) {
      window.history.replaceState(
        window.history.state,
        "",
        `${path}${window.location.search}${window.location.hash}`,
      );
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: dictionaries[language],
      crossfade,
    }),
    [language, setLanguage, crossfade],
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
