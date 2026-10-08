"use client";

import { pickLine } from "./pick";
import { useEffect, useRef, useState, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hand, HandFist, Scissors, X } from "lucide-react";
import { unlockSecret } from "@/lib/secrets";
import { cn } from "@/lib/utils";
import type { StandLines } from "./lines";

/**
 * Jan-ken (piedra, papel o tijera) contra el Stand. Guino a Boy II Man,
 * el Stand de la Parte 4 que te reta a janken. Al mejor de tres; el
 * Stand elige al azar y se burla o se queja segun salga.
 *
 * El Stand vuela y se posa encima de esta tarjeta mientras dura (lo
 * resuelve mini-stand.tsx con la ref).
 */

type HandId = "rock" | "paper" | "scissors";
const HANDS: HandId[] = ["rock", "paper", "scissors"];
const BEATS: Record<HandId, HandId> = { rock: "scissors", paper: "rock", scissors: "paper" };
const ICONS = { rock: HandFist, paper: Hand, scissors: Scissors };

const pick = (list: string[]) => pickLine(list);

interface JankenProps {
  ref?: Ref<HTMLDivElement>;
  lines: StandLines["janken"];
  onClose: () => void;
  /** Resultado de la ronda, visto desde quien juega. */
  onRound: (result: "win" | "lose" | "draw") => void;
  say: (text: string, ms?: number) => void;
}

export function Janken({ ref, lines, onClose, onRound, say }: JankenProps) {
  const [score, setScore] = useState({ you: 0, me: 0 });
  const [round, setRound] = useState<{ key: number; you: HandId; me: HandId } | null>(null);
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLButtonElement>(null);
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const over = score.you >= 2 || score.me >= 2;

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
    say(pick(lines.intro), 3200);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function leave() {
    const { you, me } = scoreRef.current;
    if ((you || me) && you < 2 && me < 2) say(pick(lines.quit), 2400);
    onClose();
  }

  function play(you: HandId) {
    if (busy || over) return;
    const me = HANDS[Math.floor(Math.random() * 3)];
    setBusy(true);
    setRound({ key: Date.now(), you, me });
    // El "jan-ken-pon" dura un instante: luego se cuenta.
    window.setTimeout(() => {
      const result = you === me ? "draw" : BEATS[you] === me ? "win" : "lose";
      onRound(result);
      const next = {
        you: scoreRef.current.you + (result === "win" ? 1 : 0),
        me: scoreRef.current.me + (result === "lose" ? 1 : 0),
      };
      setScore(next);
      setBusy(false);
      if (next.you >= 2) {
        say(pick(lines.matchLose), 3600);
        unlockSecret("janken");
      } else if (next.me >= 2) say(pick(lines.matchWin), 3600);
      else say(pick(result === "win" ? lines.lose : result === "lose" ? lines.win : lines.draw), 2200);
    }, 650);
  }

  function again() {
    setScore({ you: 0, me: 0 });
    setRound(null);
    say(pick(lines.intro), 2600);
    firstRef.current?.focus({ preventScroll: true });
  }

  return (
    <>
      <div aria-hidden="true" onClick={leave} className="fixed inset-0 z-[39] bg-black/20" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-label={lines.title}
        initial={{ opacity: 0, y: 24, rotate: -3, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, rotate: -1, scale: 1 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className="janken fixed bottom-4 left-1/2 z-[41] w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 sm:bottom-8 sm:left-auto sm:right-8 sm:translate-x-0"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-2xl uppercase tracking-wide text-ink">
            {lines.title} <span className="font-jp text-base text-accent-ink">じゃんけん</span>
          </p>
          <button
            type="button"
            onClick={leave}
            aria-label={lines.close}
            className="hit-area grid size-9 place-items-center rounded-full text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="size-4 shrink-0" aria-hidden="true" />
          </button>
        </div>

        {/* Mano contra mano. */}
        <div className="relative mb-3 grid h-20 grid-cols-2 items-center border-2 border-ink bg-surface-2">
          <AnimatePresence mode="popLayout">
            {round ? (
              <>
                <motion.span
                  key={`you-${round.key}`}
                  initial={{ x: -50, opacity: 0, rotate: -20 }}
                  animate={{ x: 0, opacity: 1, rotate: 0 }}
                  className="grid place-items-center"
                >
                  {(() => {
                    const Icon = ICONS[round.you];
                    return <Icon className="size-9 shrink-0 text-ink" aria-hidden="true" />;
                  })()}
                </motion.span>
                <motion.span
                  key={`me-${round.key}`}
                  initial={{ x: 50, opacity: 0, rotate: 20 }}
                  animate={{ x: 0, opacity: 1, rotate: 0, transition: { delay: 0.35 } }}
                  className="grid place-items-center"
                >
                  {(() => {
                    const Icon = ICONS[round.me];
                    return <Icon className="size-9 shrink-0 -scale-x-100 text-accent-ink" aria-hidden="true" />;
                  })()}
                </motion.span>
              </>
            ) : (
              <motion.span
                key="call"
                className="col-span-2 text-center font-jp text-xl text-accent-ink"
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
              >
                {lines.call}
              </motion.span>
            )}
          </AnimatePresence>
          <span aria-hidden="true" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-sm text-ink-subtle">
            VS
          </span>
        </div>

        <p className="mb-3 text-center text-sm font-semibold text-ink" aria-live="polite">
          {lines.score.replace("{you}", String(score.you)).replace("{me}", String(score.me))}
        </p>

        {over ? (
          <button
            ref={firstRef}
            type="button"
            onClick={again}
            className="accent-fill inline-flex min-h-12 w-full items-center justify-center rounded-full px-6 text-base font-bold"
          >
            {lines.again}
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {HANDS.map((hand, index) => {
              const Icon = ICONS[hand];
              return (
                <button
                  key={hand}
                  ref={index === 0 ? firstRef : undefined}
                  type="button"
                  disabled={busy}
                  onClick={() => play(hand)}
                  className={cn(
                    "janken-hand flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold text-ink transition-transform active:scale-95 disabled:opacity-60",
                  )}
                >
                  <Icon className="size-6 shrink-0" aria-hidden="true" />
                  {lines.hands[hand]}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>
    </>
  );
}
