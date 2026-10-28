"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { dictionaries, type Dictionary, type Language } from "@/data/content";
import { LANGUAGE_COOKIE, PRIVACY_PATHS, pathForLanguage } from "@/lib/language-detection";
import {
  CURTAIN_COVER_MS,
  CURTAIN_HOLD_MS,
  CURTAIN_REVEAL_MS,
  LanguageCurtain,
  type CurtainState,
} from "@/components/ui/language-curtain";

/** Como se anuncia el idioma nuevo a quien usa lector de pantalla. */
const ANNOUNCE: Record<Language, string> = {
  en: "English",
  es: "Español",
};

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
  /**
   * Cambia el idioma. Con `origin` (el boton pulsado) el cambio va bajo
   * la viñeta que nace de ese boton; sin el, o con reduced motion, el
   * texto cambia en el sitio.
   */
  setLanguage: (language: Language, origin?: Element | null) => void;
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
  const [announcement, setAnnouncement] = useState("");

  /*
    El toggle cambia el idioma en el sitio y deja la URL en la version
    equivalente con replaceState: sin recargar, sin perder el scroll, y
    con una direccion que se puede compartir.

    La cookie la lee proxy.ts: quien elige ingles a mano no vuelve a ser
    redirigido a /es por venir de Colombia.
  */
  const commit = useCallback((next: Language, fade: boolean) => {
    if (fade) setCrossfade(true);
    setLanguageState(next);
    setAnnouncement(ANNOUNCE[next]);
    try {
      document.cookie = `${LANGUAGE_COOKIE}=${next}; Path=/; Max-Age=${MANUAL_COOKIE_MAX_AGE}; SameSite=Lax`;
    } catch {
      // Sin cookie la preferencia no sobrevive a la recarga; la sesion si.
    }
  }, []);

  /*
    Con el boton como origen, el cambio es un momento de marca: la viñeta
    de language-curtain.tsx tapa la pagina desde el boton, el texto cambia
    entero debajo (sin el fundido de FadeSwap, que ya no se veria) y la
    viñeta se recoge. Fases con temporizadores y no con el fin de la
    animacion, que no llega si se interrumpe; mientras corre, otro clic no
    apila otra viñeta. El foco no se mueve: sigue en el boton.
  */
  const [curtain, setCurtain] = useState<CurtainState | null>(null);
  const busy = useRef(false);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const setLanguage = useCallback(
    (next: Language, origin?: Element | null) => {
      if (busy.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!origin || reduced) {
        commit(next, !reduced);
        return;
      }

      busy.current = true;
      const box = origin.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y),
      ) + 24;
      setCurtain({ to: next, x, y, radius, phase: "cover" });
      timers.current.push(
        window.setTimeout(() => commit(next, false), CURTAIN_COVER_MS),
        window.setTimeout(
          () => setCurtain((state) => (state ? { ...state, phase: "reveal" } : state)),
          CURTAIN_COVER_MS + CURTAIN_HOLD_MS,
        ),
        window.setTimeout(() => {
          setCurtain(null);
          busy.current = false;
        }, CURTAIN_COVER_MS + CURTAIN_HOLD_MS + CURTAIN_REVEAL_MS + 60),
      );
    },
    [commit],
  );

  /*
    Lo que el servidor no puede cambiar tras un cambio en el cliente: el
    `lang` de <html>, el titulo de la pestana y la URL.
  */
  useEffect(() => {
    document.documentElement.lang = language;
    const onPrivacy = Object.values(PRIVACY_PATHS).includes(window.location.pathname);
    document.title = onPrivacy ? dictionaries[language].privacy.title : dictionaries[language].meta.title;
    const path = pathForLanguage(window.location.pathname, language);
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
    <LanguageContext.Provider value={value}>
      {children}
      {curtain ? <LanguageCurtain state={curtain} /> : null}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return context;
}
