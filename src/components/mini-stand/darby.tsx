"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, X } from "lucide-react";
import { unlockSecret } from "@/lib/secrets";
import { cn } from "@/lib/utils";
import { pickLine } from "./pick";
import type { StandLines } from "./lines";

/**
 * Apuesta de almas: mayor o menor, con guino a Daniel D'Arby y su Stand
 * Osiris, el apostador que se queda con el alma de quien pierde. El
 * Stand destapa una carta; tu apuestas si la oculta es mayor o menor.
 * Cada uno empieza con tres almas y quien falla pierde una. Quien se
 * queda sin almas pierde la partida.
 *
 * Mismo marco que el jan-ken (el Stand se posa encima de la tarjeta).
 */

const SOULS = 3;
const SUITS = ["♠", "♥", "♦", "♣"] as const;
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

interface Card {
  /** 1 (As) a 13 (K). */
  rank: number;
  suit: (typeof SUITS)[number];
}

const pick = (list: string[]) => pickLine(list);

function draw(min = 1, max = 13): Card {
  return {
    rank: min + Math.floor(Math.random() * (max - min + 1)),
    suit: SUITS[Math.floor(Math.random() * SUITS.length)],
  };
}

/** La carta visible nunca es As ni K: asi las dos apuestas siempre tienen sentido. */
function newRound() {
  return { shown: draw(2, 12), hidden: draw() };
}

interface DarbyProps {
  ref?: Ref<HTMLDivElement>;
  lines: StandLines["darby"];
  onClose: () => void;
  /** Resultado de la ronda, visto desde quien juega. */
  onRound: (result: "win" | "lose" | "draw") => void;
  say: (text: string, ms?: number) => void;
}

function Face({ card, hidden, label }: { card?: Card; hidden?: boolean; label: string }) {
  const red = card && (card.suit === "♥" || card.suit === "♦");
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        aria-hidden="true"
        className={cn(
          "grid h-20 w-14 place-items-center border-2 border-ink bg-canvas font-display text-2xl leading-none",
          red ? "text-accent-ink" : "text-ink",
          hidden && "bg-surface-2 text-ink-subtle",
        )}
      >
        {hidden || !card ? (
          "?"
        ) : (
          <span className="flex flex-col items-center gap-0.5">
            {RANKS[card.rank - 1]}
            <span className="text-lg">{card.suit}</span>
          </span>
        )}
      </span>
      <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{label}</span>
      <span className="sr-only">{card && !hidden ? `${RANKS[card.rank - 1]} ${card.suit}` : "?"}</span>
    </div>
  );
}

export function Darby({ ref, lines, onClose, onRound, say }: DarbyProps) {
  const [souls, setSouls] = useState({ you: SOULS, me: SOULS });
  const [round, setRound] = useState(newRound);
  const [revealed, setRevealed] = useState(false);
  const [busy, setBusy] = useState(false);
  const firstRef = useRef<HTMLButtonElement>(null);
  const soulsRef = useRef(souls);
  soulsRef.current = souls;
  const over = souls.you <= 0 || souls.me <= 0;

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
    say(pick(lines.intro), 3200);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") leave();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function leave() {
    const { you, me } = soulsRef.current;
    if ((you < SOULS || me < SOULS) && you > 0 && me > 0) say(pick(lines.quit), 2400);
    onClose();
  }

  function bet(higher: boolean) {
    if (busy || over) return;
    setBusy(true);
    setRevealed(true);
    // Un instante de tension antes de contar el resultado.
    window.setTimeout(() => {
      const diff = round.hidden.rank - round.shown.rank;
      const result = diff === 0 ? "draw" : diff > 0 === higher ? "win" : "lose";
      onRound(result);
      const next = {
        you: soulsRef.current.you - (result === "lose" ? 1 : 0),
        me: soulsRef.current.me - (result === "win" ? 1 : 0),
      };
      setSouls(next);
      if (next.me <= 0) {
        say(pick(lines.matchLose), 3600);
        unlockSecret("darby");
      } else if (next.you <= 0) say(pick(lines.matchWin), 3600);
      else say(pick(result === "win" ? lines.lose : result === "lose" ? lines.win : lines.draw), 2200);
      // La siguiente carta sale tras dejar ver esta.
      window.setTimeout(() => {
        if (next.you > 0 && next.me > 0) {
          setRound(newRound());
          setRevealed(false);
        }
        setBusy(false);
      }, 1100);
    }, 750);
  }

  function again() {
    setSouls({ you: SOULS, me: SOULS });
    setRound(newRound());
    setRevealed(false);
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
            {lines.title} <span className="font-jp text-base text-accent-ink">賭け</span>
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

        {/* Mesa: la carta visible del Stand y la oculta. */}
        <div className="relative mb-3 flex h-36 items-end justify-center gap-8 pb-3 border-2 border-ink bg-surface-2">
          <Face card={round.shown} label={lines.shown} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={round.hidden.rank + round.hidden.suit + String(revealed)}
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              transition={{ duration: 0.28 }}
            >
              <Face card={round.hidden} hidden={!revealed} label={lines.hidden} />
            </motion.div>
          </AnimatePresence>
          <span aria-hidden="true" className="absolute left-1/2 top-1.5 -translate-x-1/2 font-jp text-xs text-accent-ink">
            {lines.call}
          </span>
        </div>

        <p className="mb-3 text-center text-sm font-semibold text-ink" aria-live="polite">
          {lines.score.replace("{you}", String(Math.max(souls.you, 0))).replace("{me}", String(Math.max(souls.me, 0)))}
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
          <>
            <p className="mb-2 text-center text-sm text-ink-muted">{lines.ask}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                ref={firstRef}
                type="button"
                disabled={busy}
                onClick={() => bet(true)}
                className="janken-hand flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold text-ink transition-transform active:scale-95 disabled:opacity-60"
              >
                <ArrowUp className="size-6 shrink-0" aria-hidden="true" />
                {lines.higher}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => bet(false)}
                className="janken-hand flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-semibold text-ink transition-transform active:scale-95 disabled:opacity-60"
              >
                <ArrowDown className="size-6 shrink-0" aria-hidden="true" />
                {lines.lower}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
