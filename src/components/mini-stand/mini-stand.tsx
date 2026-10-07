"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/language";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";
import { standLines, type StandEvent } from "./lines";

/**
 * Mini Stand: Paranoid Android en pequeno, flotando en la esquina como
 * los Stands flotan detras de su usuario.
 *
 * - Te mira: los ojos siguen al puntero y el cuerpo se inclina un poco.
 * - Comenta cada seccion una vez, con una frase corta.
 * - Al tocarlo golpea (オラオラ) y, en los toques siguientes, cuenta los
 *   easter eggs: es la forma de que alguien los descubra.
 * - Reacciona a lo que pasa: ZA WARUDO lo congela, la rafaga del
 *   tablero lo emociona, el Konami lo despide.
 * - Si nadie hace nada en 40 s, se duerme.
 *
 * Se puede guardar (la X del globo) y no vuelve en esa visita. Con
 * reduced motion se queda quieto y solo habla.
 */

const SLEEP_MS = 40000;
const BUBBLE_MS = 4800;
const HIDDEN_KEY = "mini-stand-hidden";

type Mood = "idle" | "punch" | "sleep" | "frozen" | "happy";

export function MiniStand() {
  const { language } = useLanguage();
  const lines = standLines[language];
  const reducedMotion = useReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");

  const rootRef = useRef<HTMLDivElement>(null);
  const [hidden, setHidden] = useState(true);
  const [bubble, setBubble] = useState<{ id: number; text: string } | null>(null);
  const [mood, setMood] = useState<Mood>("idle");
  const [punchKey, setPunchKey] = useState(0);
  const taps = useRef(0);
  const seen = useRef(new Set<string>());
  const lastActivity = useRef(0);
  const moodTimer = useRef(0);

  // Inclinacion hacia el puntero y mirada (muelles: interrumpibles).
  const leanX = useSpring(0, { stiffness: 120, damping: 18 });
  const leanY = useSpring(0, { stiffness: 120, damping: 18 });
  const tilt = useSpring(0, { stiffness: 120, damping: 16 });
  const eyeX = useSpring(0, { stiffness: 300, damping: 24 });
  const eyeY = useSpring(0, { stiffness: 300, damping: 24 });

  function say(text: string, ms = BUBBLE_MS) {
    const id = Date.now();
    // En celular el globo tapa mas pantalla: dura menos.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) ms = Math.min(ms, 3600);
    setBubble({ id, text });
    window.setTimeout(() => setBubble((current) => (current?.id === id ? null : current)), ms);
  }

  function setMoodFor(next: Mood, ms: number) {
    window.clearTimeout(moodTimer.current);
    setMood(next);
    moodTimer.current = window.setTimeout(() => setMood("idle"), ms);
  }

  // Aparece tras la entrada del hero, salvo que lo hayan guardado.
  useEffect(() => {
    let stored = false;
    try {
      stored = sessionStorage.getItem(HIDDEN_KEY) === "1";
    } catch {}
    if (stored) return;
    lastActivity.current = Date.now();
    const show = window.setTimeout(() => setHidden(false), 2200);
    /*
      Con raton saluda enseguida. En celular espera a que se deje atras el
      hero: alli el globo tapaba el boton de WhatsApp.
    */
    const touch = !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    let greet = 0;
    function greetOnce() {
      if (touch && window.scrollY < window.innerHeight * 0.7) return;
      window.removeEventListener("scroll", greetOnce);
      greet = window.setTimeout(() => say(lines.greet, 6000), touch ? 300 : 0);
    }
    const start = window.setTimeout(() => {
      if (touch) window.addEventListener("scroll", greetOnce, { passive: true });
      else greetOnce();
    }, 3200);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(start);
      window.clearTimeout(greet);
      window.removeEventListener("scroll", greetOnce);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Comenta cada seccion una vez, cuando cruza el centro de la pantalla.
  useEffect(() => {
    if (hidden) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!entry.isIntersecting || seen.current.has(id)) continue;
          seen.current.add(id);
          const text = lines.sections[id];
          if (text) say(text);
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    for (const id of Object.keys(lines.sections)) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hidden, language]);

  // Puntero: mirada e inclinacion. Actividad: despierta.
  useEffect(() => {
    if (hidden) return;
    let frame = 0;
    let last: PointerEvent | null = null;

    function wake() {
      lastActivity.current = Date.now();
      setMood((current) => (current === "sleep" ? "idle" : current));
    }

    function apply() {
      frame = 0;
      const root = rootRef.current;
      if (!root || !last) return;
      const box = root.getBoundingClientRect();
      const dx = last.clientX - (box.left + box.width / 2);
      const dy = last.clientY - (box.top + box.height / 2);
      const distance = Math.max(1, Math.hypot(dx, dy));
      eyeX.set((dx / distance) * 3.2);
      eyeY.set((dy / distance) * 2.6);
      if (!reducedMotion) {
        const pull = Math.min(1, distance / 600);
        leanX.set((dx / distance) * 14 * pull);
        leanY.set((dy / distance) * 10 * pull);
        tilt.set((dx / distance) * 7 * pull);
      }
    }

    function onPointer(event: PointerEvent) {
      wake();
      last = event;
      if (!frame) frame = requestAnimationFrame(apply);
    }

    const sleepCheck = window.setInterval(() => {
      if (Date.now() - lastActivity.current > SLEEP_MS) {
        setMood((current) => (current === "idle" ? "sleep" : current));
      }
    }, 2000);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("keydown", wake);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(sleepCheck);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", wake);
      window.removeEventListener("keydown", wake);
    };
  }, [hidden, reducedMotion, eyeX, eyeY, leanX, leanY, tilt]);

  // Reacciones a los easter eggs y al tablero (ver lib/stand-events.ts).
  useEffect(() => {
    function onEvent(event: Event) {
      const kind = (event as CustomEvent<StandEvent>).detail;
      lastActivity.current = Date.now();
      if (kind === "timestop") {
        setMoodFor("frozen", 3200);
        say(lines.events.timestop, 3200);
      } else if (kind === "ora" || kind === "barrage") {
        setPunchKey((value) => value + 1);
        setMoodFor("punch", 900);
        say(lines.events[kind], 2600);
      } else {
        setMoodFor("happy", 2400);
        say(lines.events[kind], 3200);
      }
    }
    window.addEventListener("jojo:event", onEvent);
    return () => window.removeEventListener("jojo:event", onEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  // Ocultarlo mientras se escribe: en celular el teclado lo subia encima del formulario.
  useEffect(() => {
    function onFocus(event: FocusEvent) {
      const typing = event.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName);
      rootRef.current?.classList.toggle("is-tucked", typing);
    }
    window.addEventListener("focusin", onFocus);
    return () => window.removeEventListener("focusin", onFocus);
  }, []);

  function onTap() {
    lastActivity.current = Date.now();
    const hints = finePointer ? lines.hintsPointer : lines.hintsTouch;
    const step = taps.current++ % (hints.length + 1);
    setPunchKey((value) => value + 1);
    setMoodFor("punch", 900);
    say(step === 0 ? lines.punch : hints[step - 1], step === 0 ? 2400 : 6500);
  }

  function dismiss() {
    try {
      sessionStorage.setItem(HIDDEN_KEY, "1");
    } catch {}
    setBubble(null);
    setHidden(true);
  }

  const asleep = mood === "sleep";
  const frozen = mood === "frozen";

  return (
    <AnimatePresence>
      {hidden ? null : (
        <motion.div
          ref={rootRef}
          key="stand"
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 90, rotate: 20 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.6 }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.8 }}
          className="mini-stand fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] right-3 z-40 sm:bottom-6 sm:right-6"
        >
          <AnimatePresence>
            {bubble ? (
              <motion.div
                key={bubble.id}
                role="status"
                initial={{ opacity: 0, scale: 0.6, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 6, transition: { duration: 0.18 } }}
                transition={{ type: "spring", bounce: 0.35, duration: 0.45 }}
                // El globo deja pasar los toques: lo de debajo sigue usable. Solo la X los recibe.
                className="stand-bubble pointer-events-none absolute bottom-[calc(100%+6px)] right-1 w-max max-w-[min(15rem,calc(100vw-2rem))] origin-bottom-right sm:max-w-[17rem]"
              >
                <p className="pr-8 text-sm font-medium leading-snug text-ink sm:text-[15px]">{bubble.text}</p>
                <button
                  type="button"
                  onClick={dismiss}
                  aria-label={lines.dismiss}
                  title={lines.dismiss}
                  className="hit-area pointer-events-auto absolute right-1 top-1 grid size-9 place-items-center rounded-full text-ink-subtle transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <X className="size-3.5 shrink-0" aria-hidden="true" />
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={onTap}
            aria-label={lines.label}
            style={{ x: leanX, y: leanY, rotate: tilt }}
            whileTap={{ scale: 0.92 }}
            className={cn(
              "relative block size-16 touch-manipulation sm:size-[76px]",
              !reducedMotion && !frozen && "anim-stand-float",
            )}
          >
            <StandFigure
              eyeX={eyeX}
              eyeY={eyeY}
              asleep={asleep}
              happy={mood === "happy"}
              punchKey={punchKey}
              punching={mood === "punch" && !reducedMotion}
            />
            {asleep ? (
              <span aria-hidden="true" className="stand-zzz absolute -top-2 right-0 font-jp text-sm text-accent-ink">
                z<span>z</span>
              </span>
            ) : null}
            {mood === "punch" && !reducedMotion ? (
              <span key={punchKey} aria-hidden="true" className="stand-ora absolute -left-10 top-0 font-jp text-xl">
                オラ!
              </span>
            ) : null}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface FigureProps {
  eyeX: ReturnType<typeof useSpring>;
  eyeY: ReturnType<typeof useSpring>;
  asleep: boolean;
  happy: boolean;
  punchKey: number;
  punching: boolean;
}

/**
 * El dibujo: casco crema con banda dorada, visor de tinta con dos ojos,
 * antena, torso dorado con nucleo, cola de espiritu y dos punos sueltos.
 * Contorno de tinta como el resto del manga.
 */
function StandFigure({ eyeX, eyeY, asleep, happy, punchKey, punching }: FigureProps) {
  const ink = "#161418";
  const gold = "#e3b341";
  const cream = "#ece6d8";

  // Rafaga de punos: izquierdo y derecho alternos, cuatro golpes.
  const jab = (side: 1 | -1) =>
    punching
      ? {
          // Los dos golpean hacia la pagina (el Stand vive a la derecha).
          x: [0, -14, 0, -16, 0],
          y: [0, -4, 0, -2, 0],
          transition: { duration: 0.6, ease: "easeOut" as const, delay: side === 1 ? 0 : 0.08 },
        }
      : { x: 0, y: 0 };

  return (
    <svg viewBox="0 0 80 96" className="size-full overflow-visible" aria-hidden="true">
      {/* Cola de espiritu: los Stands no tienen piernas, flotan. */}
      <path
        className="stand-tail"
        d="M30 62 C26 74 34 80 40 86 C44 90 40 94 34 93 C44 95 52 88 48 78 C46 72 50 66 50 62 Z"
        fill={cream}
        stroke={ink}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Torso. */}
      <path
        d="M24 46 Q40 40 56 46 L52 66 Q40 71 28 66 Z"
        fill={gold}
        stroke={ink}
        strokeWidth="2.6"
        strokeLinejoin="round"
      />
      <circle cx="40" cy="55" r="4.2" fill={cream} stroke={ink} strokeWidth="2" />
      <circle cx="40" cy="55" r="1.6" fill={ink} className="stand-core" />

      {/* Antena con bola, que se balancea. */}
      <g className="stand-antenna">
        <path d="M40 10 L40 3" stroke={ink} strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="40" cy="3" r="3.2" fill={gold} stroke={ink} strokeWidth="2" />
      </g>

      {/* Casco. */}
      <rect x="18" y="9" width="44" height="36" rx="13" fill={cream} stroke={ink} strokeWidth="2.6" />
      <path d="M19 20 Q40 14 61 20" fill="none" stroke={gold} strokeWidth="4" />
      {/* Visor. */}
      <rect x="23" y="22" width="34" height="16" rx="8" fill={ink} />

      {/* Ojos: siguen al puntero; dormido o feliz, son rayas. */}
      {asleep ? (
        <g stroke={cream} strokeWidth="2" strokeLinecap="round">
          <path d="M29 31 h6" />
          <path d="M45 31 h6" />
        </g>
      ) : happy ? (
        <g stroke={gold} strokeWidth="2.4" strokeLinecap="round" fill="none">
          <path d="M28.5 32 q3.5 -5 7 0" />
          <path d="M44.5 32 q3.5 -5 7 0" />
        </g>
      ) : (
        <motion.g style={{ x: eyeX, y: eyeY }}>
          <g className="stand-eyes">
            <ellipse cx="32" cy="30" rx="3.6" ry="4.2" fill={cream} />
            <ellipse cx="48" cy="30" rx="3.6" ry="4.2" fill={cream} />
            <circle cx="32.6" cy="30.6" r="1.7" fill={gold} />
            <circle cx="48.6" cy="30.6" r="1.7" fill={gold} />
          </g>
        </motion.g>
      )}

      {/* Punos sueltos, a destiempo. */}
      <motion.g key={`l${punchKey}`} animate={jab(1)}>
        <g className="stand-fist stand-fist-left">
          <rect x="4" y="48" width="14" height="13" rx="5" fill={gold} stroke={ink} strokeWidth="2.4" />
          <path d="M8 52 v5 M12 52 v5" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </motion.g>
      <motion.g key={`r${punchKey}`} animate={jab(-1)}>
        <g className="stand-fist stand-fist-right">
          <rect x="62" y="48" width="14" height="13" rx="5" fill={gold} stroke={ink} strokeWidth="2.4" />
          <path d="M68 52 v5 M72 52 v5" stroke={ink} strokeWidth="1.6" strokeLinecap="round" />
        </g>
      </motion.g>
    </svg>
  );
}
