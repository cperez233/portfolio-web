"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import type { PowerId, StandLines } from "./lines";
import { POWER_IDS } from "./powers";

/**
 * Conversacion con el Stand, en vineta de manga: el Stand habla (letra a
 * letra, como en un globo que se va llenando) y quien visita responde
 * con opciones. Desde aqui se piden los poderes y el jan-ken.
 */

type Message = { id: number; from: "stand" | "you"; text: string };
type Choice = "who" | "cris" | "power" | "janken" | "bye";

interface Props {
  ref?: Ref<HTMLDivElement>;
  lines: StandLines["chat"];
  powers: StandLines["powers"];
  onClose: () => void;
  onPower: (id: PowerId) => void;
  onJanken: () => void;
  /** El Stand gesticula mientras habla. */
  onTalk: () => void;
}

function pick<T>(list: T[], avoid?: T) {
  const pool = list.length > 1 ? list.filter((item) => item !== avoid) : list;
  return pool[Math.floor(Math.random() * pool.length)];
}

/** Texto que aparece letra a letra; con reduced motion, de una vez. */
function Typed({ text, onDone }: { text: string; onDone?: () => void }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(reduced ? text.length : 0);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    if (reduced) {
      done.current?.();
      return;
    }
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= text.length) {
        window.clearInterval(timer);
        done.current?.();
      }
    }, 24);
    return () => window.clearInterval(timer);
  }, [text, reduced]);
  return (
    <>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span className="sr-only">{text}</span>
    </>
  );
}

export function StandChat({ ref, lines, powers, onClose, onPower, onJanken, onTalk }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [typing, setTyping] = useState(false);
  const [mode, setMode] = useState<"menu" | "powers">("menu");
  // Cada "¿quien eres?" cuenta otra version; los datos de el no se repiten seguidos.
  const [whoTurn, setWhoTurn] = useState(0);
  const [lastCris, setLastCris] = useState<string | undefined>(undefined);
  const firstOption = useRef<HTMLButtonElement>(null);

  // El Stand dice las frases de la cola una tras otra.
  useEffect(() => {
    if (typing || !queue.length) return;
    const [text, ...rest] = queue;
    const timer = window.setTimeout(() => {
      setMessages((list) => [...list.slice(-4), { id: (list.at(-1)?.id ?? 0) + 1, from: "stand", text }]);
      setQueue(rest);
      setTyping(true);
      onTalk();
    }, 260);
    return () => window.clearTimeout(timer);
  }, [queue, typing, onTalk]);

  useEffect(() => {
    // Saludo al abrir: es la primera linea de la conversacion.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQueue([pick(lines.greet)]);
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!typing && !queue.length) firstOption.current?.focus({ preventScroll: true });
  }, [typing, queue.length, mode]);

  function you(text: string) {
    setMessages((list) => [...list.slice(-4), { id: (list.at(-1)?.id ?? 0) + 1, from: "you", text }]);
  }

  function choose(choice: Choice) {
    you(lines.options[choice]);
    if (choice === "who") {
      const set = lines.who[whoTurn % lines.who.length];
      setWhoTurn(whoTurn + 1);
      setQueue(set);
    } else if (choice === "cris") {
      const fact = pick(lines.cris, lastCris);
      setLastCris(fact);
      setQueue([fact]);
    } else if (choice === "power") {
      setMode("powers");
      setQueue([pick(lines.powerPrompt)]);
    } else if (choice === "janken") {
      onJanken();
    } else {
      setQueue([pick(lines.bye)]);
      window.setTimeout(onClose, 1300);
    }
  }

  const busy = typing || queue.length > 0;
  const lastStand = [...messages].reverse().find((m) => m.from === "stand");

  return (
    <>
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-[39]" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-label={lines.title}
        initial={{ opacity: 0, y: 24, rotate: -3, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className="stand-chat fixed bottom-4 left-1/2 z-[41] w-[min(23rem,calc(100vw-2rem))] -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-8 sm:translate-x-0"
      >
        <div className="mb-2 flex items-center justify-between">
          <p className="font-display text-xl uppercase tracking-wide text-ink">
            {lines.title} <span className="font-jp text-sm text-accent-ink">スタンド</span>
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={lines.close}
            className="hit-area grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </div>

        <ol className="stand-chat-log flex max-h-56 flex-col gap-2 overflow-hidden" aria-live="polite">
          {messages.map((message) => (
            <motion.li
              key={message.id}
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
              className={message.from === "stand" ? "stand-chat-msg" : "stand-chat-you"}
            >
              {message.from === "stand" && message === lastStand && typing ? (
                <Typed text={message.text} onDone={() => setTyping(false)} />
              ) : (
                message.text
              )}
            </motion.li>
          ))}
        </ol>

        <div className="mt-3 flex flex-wrap gap-2" aria-busy={busy}>
          {mode === "menu"
            ? (Object.keys(lines.options) as Choice[]).map((choice, index) => (
                <button
                  key={choice}
                  ref={index === 0 ? firstOption : undefined}
                  type="button"
                  disabled={busy}
                  onClick={() => choose(choice)}
                  className="stand-chat-option"
                >
                  {lines.options[choice]}
                </button>
              ))
            : (
              <>
                {POWER_IDS.map((id, index) => (
                  <button
                    key={id}
                    ref={index === 0 ? firstOption : undefined}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      you(powers[id].name);
                      onPower(id);
                    }}
                    className="stand-chat-option stand-chat-power"
                  >
                    {powers[id].name}
                    <span aria-hidden="true" className="font-jp text-xs text-accent-ink">
                      {powers[id].jp}
                    </span>
                  </button>
                ))}
                <button type="button" disabled={busy} onClick={() => setMode("menu")} className="stand-chat-option stand-chat-back">
                  {lines.back}
                </button>
              </>
            )}
        </div>
      </motion.div>
    </>
  );
}
