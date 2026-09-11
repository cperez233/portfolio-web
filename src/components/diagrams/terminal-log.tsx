"use client";

import { motion } from "framer-motion";
import type { LogTone, TerminalLine } from "@/data/diagrams";
import { cn } from "@/lib/utils";
import { revealItem } from "./motion";

const TONES: Record<LogTone, { glyph: string; className: string }> = {
  ok: { glyph: "✓", className: "text-tech-ok" },
  warn: { glyph: "!", className: "text-tech-warn" },
  error: { glyph: "✗", className: "text-tech-error" },
  info: { glyph: "→", className: "text-tech-info" },
};

type ResolvedLine =
  | { kind: "command"; text: string }
  | { kind: "output"; tone: LogTone; text: string };

/** Empareja cada linea `output` con su texto traducido, en orden. */
function resolveLines(lines: TerminalLine[], log: string[]): ResolvedLine[] {
  let outputIndex = 0;
  return lines.map((line) =>
    line.kind === "command"
      ? line
      : { ...line, text: log[outputIndex++] ?? "" },
  );
}

interface TerminalLogProps {
  lines: TerminalLine[];
  log: string[];
  /** Recorta la salida; en el panel de Servicios solo caben unas lineas. */
  maxLines?: number;
  /** Cursor parpadeante al final, como un terminal que sigue abierto. */
  showCaret?: boolean;
  className?: string;
}

export function TerminalLog({
  lines,
  log,
  maxLines,
  showCaret = true,
  className,
}: TerminalLogProps) {
  const resolved = resolveLines(lines, log);
  const visible = maxLines ? resolved.slice(0, maxLines) : resolved;

  return (
    <ol
      className={cn(
        "flex flex-col gap-0.5 overflow-hidden rounded-xl border border-tech-line bg-tech-term p-3 font-mono text-[11px] leading-normal sm:p-4 sm:text-xs",
        className,
      )}
    >
      {visible.map((line, index) => (
        <motion.li
          key={index}
          variants={revealItem}
          className={cn("flex min-w-0 gap-2", line.kind === "output" && "pl-4")}
        >
          {line.kind === "command" ? (
            <>
              <span aria-hidden="true" className="select-none text-tech-accent">
                $
              </span>
              <span className="min-w-0 break-all text-tech-ink">{line.text}</span>
            </>
          ) : (
            <>
              <span
                aria-hidden="true"
                className={cn("select-none", TONES[line.tone].className)}
              >
                {TONES[line.tone].glyph}
              </span>
              <span className="min-w-0 text-tech-ink-soft">{line.text}</span>
            </>
          )}
        </motion.li>
      ))}

      {showCaret ? (
        <li aria-hidden="true" className="flex items-center gap-2">
          <span className="select-none text-tech-accent">$</span>
          <span className="caret-blink inline-block h-3.5 w-2 bg-tech-ink-soft" />
        </li>
      ) : null}
    </ol>
  );
}
