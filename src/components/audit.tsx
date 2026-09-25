"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, LoaderCircle, RotateCcw, X } from "lucide-react";
import type { AuditCheckId } from "@/data/content";
import type { AuditResponse } from "@/app/api/audit/route";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { SectionEdge } from "@/components/ui/section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { cn } from "@/lib/utils";

const CHECK_ORDER: AuditCheckId[] = ["https", "mobile", "meta", "indexable", "schema", "preview"];

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: "invalid" | "unreachable" | "rateLimited" | "generic" }
  | { status: "done"; url: string; checks: Record<AuditCheckId, boolean> };

/**
 * Revision gratis: seis puntos basicos en segundos y, debajo, lo que no
 * se ve aqui (velocidad real, competencia, IA) como motivo para escribir.
 * Es a proposito corta: tiene que dar ganas de la revision completa, no
 * sustituirla.
 */
export function AuditSection() {
  const { t, language } = useLanguage();
  const copy = t.audit;
  const shouldReduceMotion = useReducedMotion();
  const [value, setValue] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.status === "loading") return;
    setState({ status: "loading" });
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: value }),
      });
      const data = (await response.json()) as AuditResponse;
      setState(
        data.ok
          ? { status: "done", url: data.url, checks: data.checks }
          : { status: "error", error: data.error },
      );
    } catch {
      setState({ status: "error", error: "generic" });
    }
  }

  const passed =
    state.status === "done" ? CHECK_ORDER.filter((id) => state.checks[id]).length : 0;
  const total = CHECK_ORDER.length;
  const fill = (text: string, url = "") =>
    text.replace("{n}", String(passed)).replace("{total}", String(total)).replace("{url}", url);

  return (
    <section
      id="audit"
      aria-labelledby="audit-title"
      className="relative z-30 overflow-x-clip bg-canvas px-5 py-24 transition-colors duration-500 sm:px-8 sm:py-28 md:px-10"
    >
      <SectionEdge />
      <div
        aria-hidden="true"
        className="glow-accent pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(48rem,120vw)] -translate-x-1/2 opacity-60"
      />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <FadeIn>
          <FadeSwap>
            <p className="mb-4 text-sm font-medium text-accent-ink">{copy.eyebrow}</p>
            <h2
              id="audit-title"
              className="text-balance text-3xl font-semibold tracking-tight text-ink sm:text-5xl"
            >
              <RevealWords text={copy.title} />
            </h2>
            <p className="mt-4 max-w-xl text-lead text-ink-muted">{copy.intro}</p>
          </FadeSwap>
        </FadeIn>

        <FadeIn delay={0.1} y={24}>
          {state.status === "done" ? null : (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="audit-url" className="sr-only">
                {copy.label}
              </label>
              <input
                id="audit-url"
                type="text"
                inputMode="url"
                autoComplete="url"
                autoCapitalize="none"
                spellCheck={false}
                required
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={copy.placeholder}
                aria-invalid={state.status === "error" || undefined}
                aria-describedby={state.status === "error" ? "audit-error" : undefined}
                className="min-h-14 w-full flex-1 rounded-full border border-line-strong bg-surface px-6 text-base text-ink placeholder:text-ink-subtle transition-colors duration-200 focus:border-accent focus:outline-none"
              />
              <button
                type="submit"
                disabled={state.status === "loading"}
                className="accent-fill inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-full px-7 text-base font-medium transition-transform duration-200 ease-[var(--ease-premium)] hover:scale-[1.02] active:scale-[0.98] disabled:cursor-wait disabled:opacity-80"
              >
                {state.status === "loading" ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
                    {copy.loading}
                  </>
                ) : (
                  copy.submit
                )}
              </button>
            </form>
          )}
        </FadeIn>

        <div aria-live="polite">
          {state.status === "error" ? (
            <p id="audit-error" className="mt-4 px-2 text-base text-tech-error">
              {copy.errors[state.error]}
            </p>
          ) : null}

          <AnimatePresence>
            {state.status === "done" ? (
              <motion.div
                key={state.url}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 rounded-3xl border border-line-strong bg-surface p-6 shadow-[var(--tech-card-shadow)] transition-colors duration-500 sm:p-8"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                  <p className="font-mono text-sm text-ink-subtle">{state.url}</p>
                  <p className="text-base font-medium text-ink">{fill(copy.score)}</p>
                </div>

                <motion.ul
                  className="mt-6 grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2"
                  initial={shouldReduceMotion ? false : "hidden"}
                  animate="show"
                  variants={{
                    hidden: {},
                    show: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
                  }}
                >
                  {CHECK_ORDER.map((id) => {
                    const ok = state.checks[id];
                    const check = copy.checks[id];
                    return (
                      <motion.li
                        key={id}
                        className="flex gap-3"
                        variants={{
                          hidden: { opacity: 0, y: 12 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                        }}
                      >
                        <motion.span
                          variants={{
                            hidden: { scale: 0 },
                            show: { scale: 1, transition: { type: "spring", stiffness: 500, damping: 18, delay: 0.1 } },
                          }}
                          className={cn(
                            "mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                            ok ? "bg-tech-ok/15 text-tech-ok" : "bg-tech-error/15 text-tech-error",
                          )}
                        >
                          {ok ? (
                            <Check aria-hidden="true" className="size-3.5" />
                          ) : (
                            <X aria-hidden="true" className="size-3.5" />
                          )}
                        </motion.span>
                        <p className="leading-snug">
                          <span className="block text-base font-medium text-ink">{check.label}</span>
                          <span className="text-sm text-ink-muted">{ok ? check.pass : check.fail}</span>
                        </p>
                      </motion.li>
                    );
                  })}
                </motion.ul>

                {/* El gancho: lo que esta revision no mide. */}
                <div className="mt-8 rounded-2xl bg-accent-dim p-5 sm:p-6">
                  <p className="text-lg font-medium tracking-tight text-ink">{copy.hookTitle}</p>
                  <p className="mt-2 text-base leading-relaxed text-ink-muted">{copy.hookBody}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <a
                      href={buildWhatsappUrl(fill(copy.whatsappMessage, state.url))}
                      onClick={() => trackWhatsappClick("audit", language)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="accent-fill group inline-flex min-h-12 items-center gap-2 rounded-full px-6 text-sm font-medium transition-transform duration-200 ease-[var(--ease-premium)] hover:scale-[1.03] active:scale-[0.98]"
                    >
                      {copy.cta}
                      <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setValue("");
                        setState({ status: "idle" });
                      }}
                      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-ink-muted transition-colors hover:text-accent-ink"
                    >
                      <RotateCcw aria-hidden="true" className="size-4" />
                      {copy.again}
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
