"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type Variants,
} from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { navLinks } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { useTheme } from "@/lib/theme";
import { LanguageToggle } from "./LanguageToggle";
import { cn } from "@/lib/utils";

/*
  Pildora que se recoge en un circulo al bajar y se despliega al subir
  (patron "floating collapse pill" de la skill de diseno, adaptado del
  AnimatedNavFramer). Mientras se lee, la navegacion ocupa 48px en lugar
  de toda la barra; un gesto hacia arriba o un toque la devuelven.
*/

/** Cuanto hay que subir desde donde se recogio para que se despliegue. */
const EXPAND_SCROLL_THRESHOLD = 80;
/** Por encima de esto nunca se recoge: en el hero la pildora va entera. */
const COLLAPSE_AFTER = 150;

/*
  Resorte sin rebote para el ancho: con rebote la pildora bajaba hasta
  29px, por debajo del circulo de 48, y recortaba el icono.
*/
const containerVariants: Variants = {
  expanded: {
    width: "auto",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.45,
      staggerChildren: 0.06,
      delayChildren: 0.12,
    },
  },
  collapsed: {
    width: "3rem",
    transition: {
      type: "spring",
      bounce: 0,
      duration: 0.4,
      when: "afterChildren",
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

const logoVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    rotate: 0,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: {
    opacity: 0,
    x: -25,
    rotate: -180,
    transition: { duration: 0.25 },
  },
};

const itemVariants: Variants = {
  expanded: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", damping: 15 },
  },
  collapsed: {
    opacity: 0,
    x: -20,
    scale: 0.95,
    transition: { duration: 0.18 },
  },
};

/*
  El icono del circulo no hereda las variantes de la pildora: tiene su
  propio `animate`. Como hijo, la pildora esperaba a que apareciera
  (`afterChildren`) antes de encogerse, y durante casi un segundo se veia
  el icono en medio de la barra aun abierta. Ahora entra solo cuando la
  pildora ya termino de recogerse, y sale al instante al abrirla.
*/
const collapsedIconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8, transition: { duration: 0.08 } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
};

/*
  Panel del menu en celular: cae desde la pildora y se repliega hacia
  ella. Solo opacidad y transform; animar `filter` anularia el
  backdrop-filter del vidrio en algunos navegadores.
*/
const panelVariants: Variants = {
  closed: {
    opacity: 0,
    y: -10,
    scale: 0.94,
    pointerEvents: "none",
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
      opacity: { duration: 0.22, delay: 0.08, ease: "easeIn" },
      staggerChildren: 0.035,
      staggerDirection: -1,
    },
  },
  open: {
    opacity: 1,
    y: 0,
    scale: 1,
    pointerEvents: "auto",
    transition: {
      duration: 0.34,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

const panelItemVariants: Variants = {
  closed: { opacity: 0, y: -6, transition: { duration: 0.16, ease: "easeIn" } },
  open: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
};

export function FloatingNav() {
  const { t } = useLanguage();
  // La verdad del tema vive en la clase de <html>; el store solo la lee
  // y la escribe, de modo que el icono no puede desincronizarse.
  const { isDark, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const [isExpanded, setExpanded] = useState(true);
  // El icono del circulo, solo cuando la pildora ya esta recogida del todo.
  const [isFullyCollapsed, setFullyCollapsed] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);
  const scrollPositionOnCollapse = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    lastScrollY.current = latest;

    // Con el menu abierto no se recoge: se cerraria bajo el dedo.
    if (isMenuOpen) return;

    if (isExpanded && latest > previous && latest > COLLAPSE_AFTER) {
      setExpanded(false);
      scrollPositionOnCollapse.current = latest;
    } else if (
      !isExpanded &&
      latest < previous &&
      (scrollPositionOnCollapse.current - latest > EXPAND_SCROLL_THRESHOLD ||
        latest < COLLAPSE_AFTER)
    ) {
      setExpanded(true);
    }
  });

  // Cierra el menu movil al tocar fuera o con Escape.
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !panelRef.current?.contains(target) &&
        !menuButtonRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isMenuOpen]);

  const state = isExpanded ? "expanded" : "collapsed";

  return (
    <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 sm:top-5">
      <motion.nav
        aria-label={t.nav.about}
        initial={shouldReduceMotion ? false : { y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 18, stiffness: 250 }}
      >
        <motion.div
          data-scrolled="true"
          variants={containerVariants}
          initial={false}
          animate={state}
          onAnimationStart={(definition) => {
            if (definition === "expanded") setFullyCollapsed(false);
          }}
          onAnimationComplete={(definition) => {
            if (definition === "collapsed") setFullyCollapsed(true);
          }}
          whileHover={!isExpanded ? { scale: 1.08 } : undefined}
          whileTap={!isExpanded ? { scale: 0.95 } : undefined}
          onClick={() => {
            if (!isExpanded) setExpanded(true);
          }}
          // Si el foco de teclado entra con la pildora recogida, se abre:
          // nadie tiene que adivinar que hay enlaces dentro del circulo.
          onFocusCapture={() => setExpanded(true)}
          className={cn(
            "liquid-glass relative flex h-12 items-center overflow-hidden rounded-full",
            !isExpanded && "cursor-pointer justify-center",
          )}
        >
          {/*
            Monograma: las iniciales, en el color del nombre del hero. Al
            pasar el raton cada letra rueda hacia arriba y vuelve a entrar
            desde abajo en el acento, la P un instante despues que la C.
          */}
          <motion.a
            href="#"
            variants={logoVariants}
            tabIndex={isExpanded ? undefined : -1}
            aria-label={t.footer.links.home}
            className="group flex shrink-0 items-center pl-4 pr-1 text-lg font-black tracking-tighter text-name transition-colors duration-500"
          >
            {["C", "P"].map((letter, index) => (
              <span
                key={letter}
                aria-hidden="true"
                className="relative inline-block overflow-hidden leading-none"
              >
                <span
                  style={{ transitionDelay: `${index * 70}ms` }}
                  className="block transition-transform duration-500 ease-[var(--ease-premium)] group-hover:-translate-y-full motion-reduce:transition-none"
                >
                  {letter}
                </span>
                <span
                  style={{ transitionDelay: `${index * 70}ms` }}
                  className="absolute inset-0 block translate-y-full text-accent-ink transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-y-0 motion-reduce:transition-none"
                >
                  {letter}
                </span>
              </span>
            ))}
          </motion.a>

          <div
            className={cn(
              "flex items-center gap-1 pr-2 sm:gap-2",
              !isExpanded && "pointer-events-none",
            )}
            // inert y no aria-hidden: saca del orden de tabulacion tambien
            // los enlaces del selector de idioma mientras esta recogida.
            inert={!isExpanded}
          >
            {/* Enlaces en linea desde md */}
            <ul className="hidden items-center md:flex">
              {navLinks.map((link) => (
                <motion.li key={link.key} variants={itemVariants}>
                  <a
                    href={link.href}
                    tabIndex={isExpanded ? undefined : -1}
                    className="group relative inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-sm font-medium text-ink-muted transition-colors duration-200 hover:text-ink"
                  >
                    {t.nav[link.key]}
                    {/* Subrayado que se dibuja desde el centro. */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-3 bottom-1.5 h-px origin-center scale-x-0 bg-accent-ink transition-transform duration-300 ease-[var(--ease-premium)] group-hover:scale-x-100"
                    />
                  </a>
                </motion.li>
              ))}
            </ul>

            {/* Menu desplegable por debajo de md */}
            <motion.button
              ref={menuButtonRef}
              variants={itemVariants}
              type="button"
              tabIndex={isExpanded ? undefined : -1}
              onClick={(event) => {
                event.stopPropagation();
                setMenuOpen((value) => !value);
              }}
              aria-expanded={isMenuOpen}
              aria-controls="floating-nav-panel"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className="inline-flex size-9 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:text-ink md:hidden"
            >
              <Menu className="size-5" aria-hidden="true" />
            </motion.button>

            <motion.span
              variants={itemVariants}
              aria-hidden="true"
              className="mx-1 h-5 w-px shrink-0 bg-line-strong"
            />

            <motion.div variants={itemVariants} className="flex items-center">
              <LanguageToggle />
            </motion.div>

            <motion.button
              variants={itemVariants}
              type="button"
              tabIndex={isExpanded ? undefined : -1}
              onClick={toggleTheme}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors duration-200 hover:text-accent-ink"
              aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="size-4" aria-hidden="true" />
              ) : (
                <Moon className="size-4" aria-hidden="true" />
              )}
            </motion.button>
          </div>

          {/*
            Estado recogido: un boton de verdad encima del circulo, para
            teclado y lector de pantalla. El clic en cualquier punto de la
            pildora tambien la abre (onClick del contenedor).
          */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.button
              type="button"
              variants={collapsedIconVariants}
              initial={false}
              animate={isFullyCollapsed && !isExpanded ? "visible" : "hidden"}
              tabIndex={isExpanded ? -1 : undefined}
              aria-hidden={isExpanded}
              aria-label="Open navigation"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded(true);
              }}
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-full text-ink",
                !isExpanded && "pointer-events-auto",
              )}
            >
              <Menu className="size-5" aria-hidden="true" />
            </motion.button>
          </div>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && isExpanded ? (
          <motion.div
            key="floating-nav-panel"
            id="floating-nav-panel"
            ref={panelRef}
            data-scrolled="true"
            variants={panelVariants}
            initial={shouldReduceMotion ? false : "closed"}
            animate="open"
            exit={
              shouldReduceMotion
                ? { opacity: 0, transition: { duration: 0 } }
                : "closed"
            }
            style={{ transformOrigin: "top center" }}
            className="liquid-glass mt-2 rounded-2xl p-2 md:hidden"
          >
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <motion.li key={link.key} variants={panelItemVariants}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-12 items-center rounded-xl px-4 text-base text-ink-muted transition-colors duration-200 hover:bg-surface-2 hover:text-ink"
                  >
                    {t.nav[link.key]}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
