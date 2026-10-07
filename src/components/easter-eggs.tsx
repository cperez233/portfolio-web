"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { emitStandEvent } from "@/lib/stand-events";
import { unlockSecret } from "@/lib/secrets";

/**
 * Easter eggs de JoJo, todos con teclado y sin nada visible que los
 * anuncie (la consola da la pista):
 *
 * - Escribir "ora": rafaga de オラ, la de Jotaro.
 * - Escribir "muda": rafaga de 無駄, la de DIO.
 * - Codigo Konami: congelado sepia con la flecha "To Be Continued",
 *   el final de cada episodio.
 * - Cambiar de pestana: el titulo hace ゴゴゴ hasta que vuelves.
 *
 * En tactil quedan los dos que ya viven en la pagina: el retrato del hero
 * (ZA WARUDO) y los golpes al tablero de GitHub.
 *
 * Nada se dispara mientras se escribe en un campo, y con reduced motion
 * las rafagas no salen: son puro movimiento.
 */

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

type Egg = { id: number; kind: "ora" | "muda" | "tbc" };

const BARRAGE: Record<"ora" | "muda", string[]> = {
  ora: ["オラオラオラオラ", "オラオラオラオラオラ", "オラオラオラ", "オラオラオラオラ"],
  muda: ["無駄無駄無駄無駄", "無駄無駄無駄無駄無駄", "無駄無駄無駄", "無駄無駄無駄無駄"],
};

const AWAY_TITLE = { es: "ゴゴゴゴ… ¿te vas?", en: "ゴゴゴゴ… leaving already?" };

function isTyping(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
}

export function EasterEggs() {
  const { t, language } = useLanguage();
  const reducedMotion = useReducedMotion();
  const [egg, setEgg] = useState<Egg | null>(null);
  const typed = useRef("");
  const konami = useRef(0);

  // Teclado: "ora", "muda" y Konami.
  useEffect(() => {
    function fire(kind: Egg["kind"]) {
      emitStandEvent(kind);
      unlockSecret(kind);
      if (reducedMotion && kind !== "tbc") return;
      setEgg({ id: Date.now(), kind });
    }

    function onKey(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;

      konami.current = key === KONAMI[konami.current] ? konami.current + 1 : key === KONAMI[0] ? 1 : 0;
      if (konami.current === KONAMI.length) {
        konami.current = 0;
        fire("tbc");
        return;
      }

      if (key.length !== 1) return;
      typed.current = (typed.current + key).slice(-4);
      if (typed.current.endsWith("ora")) {
        typed.current = "";
        fire("ora");
      } else if (typed.current === "muda") {
        typed.current = "";
        fire("muda");
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reducedMotion]);

  // Se borra solo; Escape o un clic lo cierran antes.
  useEffect(() => {
    if (!egg) return;
    const timer = window.setTimeout(() => setEgg(null), egg.kind === "tbc" ? 4200 : 1700);
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setEgg(null);
    };
    window.addEventListener("keydown", close);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", close);
    };
  }, [egg]);

  // Pestana en segundo plano: ゴゴゴ en el titulo.
  useEffect(() => {
    let saved = document.title;
    function onVisibility() {
      if (document.hidden) {
        saved = document.title;
        document.title = AWAY_TITLE[language];
      } else if (document.title === AWAY_TITLE[language]) {
        document.title = saved;
      }
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [language]);

  // Firma y pista en la consola, una vez.
  useEffect(() => {
    const w = window as Window & { __jojoSigned?: boolean };
    if (w.__jojoSigned) return;
    w.__jojoSigned = true;
    console.info(
      "%cゴゴゴ Cristian Pérez%c · diseño y desarrollo · https://cristianperez.me",
      "font-weight:700;color:#e3b341;font-size:14px",
      "",
    );
    // Leer la consola ya es un secreto: solo se dice como invocar al Stand.
    console.info(
      language === "es"
        ? "¿Lees la consola? Respeto. Invoca al Stand: stand()"
        : "Reading the console? Respect. Summon the Stand: stand()",
    );
  }, [language]);

  if (!egg) return null;

  if (egg.kind === "tbc") {
    return (
      <div
        key={egg.id}
        aria-hidden="true"
        onClick={() => setEgg(null)}
        className="egg-freeze fixed inset-0 z-[90] flex items-end p-6 sm:p-10"
      >
        <div className="tbc-arrow egg-tbc">
          <span className="tbc-arrow-text">{t.jojo.toBeContinued}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      key={egg.id}
      aria-hidden="true"
      onClick={() => setEgg(null)}
      className={`egg-barrage egg-barrage-${egg.kind} fixed inset-0 z-[90]`}
    >
      {BARRAGE[egg.kind].map((line, i) => (
        <span key={i} style={{ animationDelay: `${i * 80}ms` }}>
          {line}
        </span>
      ))}
    </div>
  );
}
