"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Lock } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { SECRET_IDS, readSecrets, type SecretDetail, type SecretId } from "@/lib/secrets";
import { cn } from "@/lib/utils";

/**
 * Secretos: el contador del pie (Secretos 3/10, con la lista de los
 * encontrados y ??? en los demas) y el aviso al encontrar uno. Ninguno
 * dice como se consigue: el nombre solo aparece cuando ya es tuyo.
 */

const copy = {
  es: {
    button: "Secretos",
    found: "Secreto encontrado",
    title: "Secretos encontrados",
    locked: "???",
    close: "Cerrar secretos",
    names: {
      timestop: "ZA WARUDO",
      ora: "ORA ORA ORA",
      muda: "MUDA MUDA MUDA",
      tbc: "To Be Continued",
      barrage: "Ráfaga en el tablero",
      arrow: "Flechado",
      janken: "Le ganaste al Stand",
      sleep: "Lo dejaste dormir",
      night: "Turno de noche",
      console: "Usuario de consola",
      kingcrimson: "Tiempo borrado",
    } satisfies Record<SecretId, string>,
  },
  en: {
    button: "Secrets",
    found: "Secret found",
    title: "Secrets found",
    locked: "???",
    close: "Close secrets",
    names: {
      timestop: "ZA WARUDO",
      ora: "ORA ORA ORA",
      muda: "MUDA MUDA MUDA",
      tbc: "To Be Continued",
      barrage: "Board barrage",
      arrow: "Struck by the Arrow",
      janken: "You beat the Stand",
      sleep: "You let it sleep",
      night: "Night shift",
      console: "Console user",
      kingcrimson: "Erased time",
    } satisfies Record<SecretId, string>,
  },
};

function useFoundSecrets() {
  const [found, setFound] = useState<SecretId[]>([]);
  useEffect(() => {
    // Leer localStorage solo en cliente: el servidor no lo conoce.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFound(readSecrets());
    const onSecret = (event: Event) => setFound([...(event as CustomEvent<SecretDetail>).detail.found]);
    window.addEventListener("jojo:secret", onSecret);
    return () => window.removeEventListener("jojo:secret", onSecret);
  }, []);
  return found;
}

/** Pildora del pie con la lista. */
export function SecretsCounter({ className }: { className?: string }) {
  const { language } = useLanguage();
  const t = copy[language];
  const found = useFoundSecrets();
  const [open, setOpen] = useState(false);
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 text-sm text-ink-subtle transition-colors hover:text-ink"
      >
        <span aria-hidden="true" className="font-jp text-accent-ink">
          秘
        </span>
        {t.button}
        <span className="font-mono tabular-nums text-ink">
          {found.length}/{SECRET_IDS.length}
        </span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={listId}
            role="dialog"
            aria-label={t.title}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ type: "spring", bounce: 0, duration: 0.35 }}
            className="secrets-panel absolute bottom-full left-0 z-30 mb-2 w-[min(18rem,calc(100vw-2.5rem))] origin-bottom-left"
          >
            <p className="mb-2 flex items-baseline justify-between text-sm font-semibold text-ink">
              {t.title}
              <span className="font-mono tabular-nums">
                {found.length}/{SECRET_IDS.length}
              </span>
            </p>
            <ul className="flex flex-col">
              {SECRET_IDS.map((id) => {
                const has = found.includes(id);
                return (
                  <li
                    key={id}
                    className={cn(
                      "flex items-center gap-2 border-t border-line py-1.5 text-sm",
                      has ? "text-ink" : "text-ink-subtle",
                    )}
                  >
                    {has ? (
                      <span aria-hidden="true" className="font-jp text-accent-ink">
                        ゴ
                      </span>
                    ) : (
                      <Lock aria-hidden="true" className="size-3.5 shrink-0" />
                    )}
                    {has ? t.names[id] : t.locked}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Aviso al encontrar un secreto: cae como una placa de manga. */
export function SecretToast() {
  const { language } = useLanguage();
  const t = copy[language];
  const [toast, setToast] = useState<{ key: number; id: SecretId; count: number } | null>(null);

  useEffect(() => {
    let timer = 0;
    const onSecret = (event: Event) => {
      const { id, found } = (event as CustomEvent<SecretDetail>).detail;
      window.clearTimeout(timer);
      setToast({ key: Date.now(), id, count: found.length });
      timer = window.setTimeout(() => setToast(null), 3800);
    };
    window.addEventListener("jojo:secret", onSecret);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("jojo:secret", onSecret);
    };
  }, []);

  return (
    <div role="status" className="pointer-events-none fixed left-3 top-20 z-[60] sm:left-6 sm:top-24">
      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.key}
            initial={{ opacity: 0, x: -40, rotate: -6, scale: 1.2 }}
            animate={{ opacity: 1, x: 0, rotate: -2, scale: 1 }}
            exit={{ opacity: 0, x: -30, transition: { duration: 0.2 } }}
            transition={{ type: "spring", bounce: 0.35, duration: 0.55 }}
            className="secret-toast"
          >
            <span aria-hidden="true" className="secret-toast-kanji font-jp">
              秘
            </span>
            <span className="flex flex-col">
              <span className="text-[13px] text-ink-muted">
                {t.found} · {toast.count}/{SECRET_IDS.length}
              </span>
              <span className="font-display text-xl uppercase leading-tight tracking-wide text-ink">
                {t.names[toast.id]}
              </span>
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
