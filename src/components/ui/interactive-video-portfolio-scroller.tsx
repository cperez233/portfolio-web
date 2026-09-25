"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { TechVisual } from "@/components/diagrams";
import { menuItems, type ServiceItem } from "@/data/site";
import { DESKTOP_QUERY } from "@/lib/breakpoints";
import { useLanguage } from "@/lib/language";
import { jumpScrollTo, smoothScrollTo } from "@/lib/smooth-scroll";
import { useMediaQuery } from "@/lib/use-media-query";
import { FadeIn } from "./FadeIn";
import { FadeSwap } from "./FadeSwap";
import { SectionEdge } from "./section-transition";
import { cn } from "@/lib/utils";
import { RevealWords } from "@/components/ui/reveal-words";

/**
 * Seccion de Servicios: dos presentaciones del mismo contenido.
 *
 * - Escritorio (variante `desktop`: ancho lg y puntero no tactil): lista
 *   con panel de detalle y scroll-lock aparente, pensado para rueda y
 *   trackpad.
 * - Movil y tablet, incluido un iPad en horizontal: tarjetas en orden de
 *   lectura que ruedan en 3D al pasar, con el scroll 100% nativo.
 *
 * El scroll-lock se atascaba en pantallas tactiles: el tramo fijado mide
 * cinco pantallas, y su panel con `overflow-y-auto` se quedaba el gesto
 * del dedo en cuanto desbordaba, asi que la pagina parecia congelada.
 *
 * El HTML del servidor trae las dos presentaciones y el CSS muestra la
 * que toca, sin salto de layout al hidratar. Despues, en escritorio, las
 * tarjetas se desmontan (useMediaQuery), para que su useScroll no mida
 * nada mientras estan ocultas.
 */
export default function InteractiveVideoScroller() {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <section
      id="services"
      className="layer-top relative z-20 overflow-x-clip rounded-t-[32px] bg-surface transition-colors duration-500 sm:rounded-t-[48px]"
    >
      <SectionEdge />

      {isDesktop ? null : <ServiceCards />}
      <DesktopScroller />
    </section>
  );
}

/**
 * Movil y tablet: una tarjeta por servicio, con efecto rolodex.
 *
 * Distinto a propósito del mazo de Proyectos, que fija las tarjetas y
 * las apila. Aqui nada se fija: cada tarjeta fluye con el scroll y rueda
 * sobre su eje horizontal al pasar. Entra desde abajo inclinada hacia
 * atras y en sombra, se endereza y se ilumina al llegar al centro, y se
 * inclina hacia delante al salir por arriba. Sin sticky ni contenedores
 * con scroll propio: el gesto siempre mueve la pagina.
 */
function ServiceCards() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const total = menuItems.length;
  const listRef = useRef<HTMLOListElement>(null);
  /*
    Tarjeta que cruza el centro de la pantalla y si la lista esta a la
    vista. Alimentan el indice flotante: en celular la seccion mide varias
    pantallas y sin el no se sabe cuantos servicios quedan.
  */
  const [current, setCurrent] = useState(0);
  const [listVisible, setListVisible] = useState(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const cards = Array.from(list.children) as HTMLElement[];
    const cardObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCurrent(cards.indexOf(entry.target as HTMLElement));
          }
        }
      },
      // Franja fina en el centro: solo una tarjeta la cruza a la vez.
      { rootMargin: "-50% 0px -50% 0px" },
    );
    cards.forEach((card) => cardObserver.observe(card));

    /*
      El indice aparece con la primera tarjeta ya en pantalla y se va
      antes de que acabe la ultima, para no tapar el cierre de la seccion.
    */
    const listObserver = new IntersectionObserver(
      ([entry]) => setListVisible(entry.isIntersecting),
      { rootMargin: "-35% 0px -35% 0px" },
    );
    listObserver.observe(list);

    return () => {
      cardObserver.disconnect();
      listObserver.disconnect();
    };
  }, []);

  return (
    <div className="relative z-10 px-5 py-20 sm:px-8 sm:py-24 md:px-10 desktop:hidden">
      <div className="mx-auto w-full max-w-3xl">
        <FadeIn>
          <FadeSwap>
            <p className="mb-4 text-sm font-medium text-accent-ink">
              {t.services.eyebrow}
            </p>
            <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
              <RevealWords text={t.services.title} />
            </h2>
          </FadeSwap>
        </FadeIn>

        <ol
          ref={listRef}
          className="mt-10 flex touch-manipulation flex-col gap-5 sm:gap-6"
        >
          {menuItems.map((item, index) => (
            <ServiceCard
              key={item.number}
              item={item}
              index={index}
              total={total}
              reduceMotion={Boolean(shouldReduceMotion)}
            />
          ))}
        </ol>
      </div>

      <ServiceIndex
        current={current}
        total={total}
        name={t.services.items[current]?.name ?? ""}
        visible={listVisible}
        reduceMotion={Boolean(shouldReduceMotion)}
      />
    </div>
  );
}

interface ServiceIndexProps {
  current: number;
  total: number;
  name: string;
  visible: boolean;
  reduceMotion: boolean;
}

/**
 * Indice flotante de Servicios en celular: la version de bolsillo de la
 * lista de escritorio. Numero, nombre del servicio que se esta leyendo y
 * una marca por servicio que se llena al avanzar.
 *
 * Decorativo (aria-hidden): cada tarjeta ya lleva su "02 / 06" en el
 * texto. Sin eventos de puntero, para que nunca se quede con un toque
 * pensado para la tarjeta de debajo.
 */
function ServiceIndex({ current, total, name, visible, reduceMotion }: ServiceIndexProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          aria-hidden="true"
          initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex justify-center px-5 desktop:hidden"
        >
          <div className="flex w-full max-w-sm items-center gap-3 rounded-full border border-tech-line bg-tech-bg/95 py-2.5 pl-4 pr-5 shadow-[var(--tech-card-shadow)] transition-colors duration-500">
            <span className="shrink-0 font-mono text-xs tabular-nums text-tech-ink-subtle">
              <span className="text-tech-accent">
                {String(current + 1).padStart(2, "0")}
              </span>
              /{String(total).padStart(2, "0")}
            </span>

            <span className="relative min-w-0 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={name}
                  initial={reduceMotion ? false : { y: "100%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? undefined : { y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="block truncate text-sm font-medium text-tech-ink"
                >
                  {name}
                </motion.span>
              </AnimatePresence>
            </span>

            <span className="flex shrink-0 gap-1">
              {Array.from({ length: total }, (_, index) => (
                <span
                  key={index}
                  className={cn(
                    "h-1 rounded-full transition-all duration-500 ease-[var(--ease-premium)]",
                    index === current
                      ? "w-4 bg-tech-accent"
                      : index < current
                        ? "w-1 bg-tech-accent/50"
                        : "w-1 bg-tech-ink-subtle/40",
                  )}
                />
              ))}
            </span>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

interface ServiceCardProps {
  item: ServiceItem;
  index: number;
  total: number;
  reduceMotion: boolean;
}

function ServiceCard({ item, index, total, reduceMotion }: ServiceCardProps) {
  const { t } = useLanguage();
  const copy = t.services.items[index];
  const itemRef = useRef<HTMLLIElement>(null);

  /*
    Progreso propio de cada tarjeta: 0 cuando su borde superior asoma por
    abajo, 0.5 con la tarjeta centrada, 1 cuando su borde inferior sale
    por arriba. Se mide el <li>, que no lleva transform, y se anima el
    <article> de dentro. Aqui medir cada tarjeta si es fiable: ninguna va
    fijada al viewport.
  */
  const { scrollYProgress } = useScroll({
    target: itemRef,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [16, 0, 0, -12],
  );
  const y = useTransform(scrollYProgress, [0, 0.35], [48, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0.92, 1, 1, 0.95],
  );
  // Sombra fuera del centro y luz en el centro: el foco.
  const shade = useTransform(
    scrollYProgress,
    [0, 0.3, 0.7, 1],
    [0.5, 0, 0, 0.55],
  );
  const glow = useTransform(
    scrollYProgress,
    [0.2, 0.42, 0.58, 0.8],
    [0.15, 1, 1, 0.15],
  );

  const tags = copy.tag.split(" / ");

  return (
    <li ref={itemRef}>
      <motion.article
        style={
          reduceMotion
            ? undefined
            : {
                rotateX,
                y,
                scale,
                transformPerspective: 1100,
                willChange: "transform",
              }
        }
        className="relative overflow-hidden rounded-3xl border border-tech-line bg-tech-bg shadow-[var(--tech-card-shadow)] transition-[background-color,border-color,color,box-shadow] duration-500"
      >
        {/* Filo de acento: se enciende con la tarjeta en el centro. */}
        <motion.span
          aria-hidden="true"
          style={reduceMotion ? undefined : { opacity: glow }}
          className="pointer-events-none absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-tech-accent to-transparent"
        />
        {/* Borde de luz del foco, por encima del borde zinc. */}
        <motion.span
          aria-hidden="true"
          style={{ opacity: reduceMotion ? 0 : glow }}
          className="pointer-events-none absolute inset-0 z-10 rounded-3xl ring-1 ring-inset ring-tech-accent/25"
        />

        <div className="relative h-32 sm:h-36">
          <TechVisual
            id={item.diagram}
            density="compact"
            showBarOnMobile
            className="h-full"
          />
          {/* Funde el diagrama con el texto de debajo. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-tech-bg to-transparent"
          />
        </div>

        <div className="relative px-5 pb-6 pt-4 sm:px-7 sm:pb-7">
          <FadeSwap>
            <p className="text-sm tabular-nums text-tech-ink-subtle">
              <span className="text-tech-accent">{item.number}</span>
              {" / "}
              {String(total).padStart(2, "0")}
            </p>
            <h3 className="mt-2 text-balance text-[1.375rem] font-medium leading-snug tracking-tight text-tech-ink sm:text-2xl">
              {copy.name}
            </h3>
            {/* Tags que entran uno tras otro al llegar la tarjeta. */}
            <motion.ul
              className="mt-3 flex flex-wrap gap-1.5"
              initial={reduceMotion ? false : "hidden"}
              whileInView="show"
              viewport={{ once: true, margin: "-15% 0px" }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
              }}
            >
              {tags.map((tag) => (
                <motion.li
                  key={tag}
                  variants={{
                    hidden: { opacity: 0, y: 8, scale: 0.9 },
                    show: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: { type: "spring", stiffness: 380, damping: 24 },
                    },
                  }}
                  className="rounded-full border border-tech-accent/20 bg-tech-accent/[0.07] px-2.5 py-0.5 text-xs text-tech-accent"
                >
                  {tag}
                </motion.li>
              ))}
            </motion.ul>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-tech-ink-soft sm:text-base">
              {copy.description}
            </p>
          </FadeSwap>
        </div>

        {/*
          Sombra de entrada y salida; en el centro desaparece. Del color del
          lienzo y no negra: en el tema claro el negro dejaba la tarjeta
          sucia, y en el oscuro el lienzo ya es casi negro.
        */}
        {reduceMotion ? null : (
          <motion.div
            aria-hidden="true"
            style={{ opacity: shade }}
            className="pointer-events-none absolute inset-0 z-20 bg-canvas"
          />
        )}
      </motion.article>
    </li>
  );
}

/*
  Relevo del texto del panel al cambiar de servicio: el bloque entrante
  sube por piezas (etiqueta, titulo, descripcion), como el "content
  swap" de la skill de diseno.
*/
/**
 * Tras el ultimo giro de rueda, el hover sigue ignorado este tiempo: lo
 * que tarda en asentarse la inercia de Lenis (lerp 0.085).
 */
const SCROLL_QUIET_MS = 700;

const panelTextVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const panelLineVariants: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Escritorio: scroller con scroll-lock aparente.
 *
 * El contenedor mide una pantalla por servicio y el panel interior va
 * `sticky`: la seccion parece quedarse quieta mientras el progreso del
 * scroll cambia el servicio activo. El scroll nativo nunca se
 * intercepta, asi que el usuario siempre puede salir.
 *
 * Fuera de escritorio este bloque va en `display: none`: el
 * IntersectionObserver nunca lo ve entrar, asi que el bucle de medicion
 * no llega a arrancar y el coste en movil es cero.
 */
function DesktopScroller() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  /*
    Servicio bajo el raton. Manda sobre el que marca el scroll: se puede
    recorrer la lista pasando el cursor sin tener que bajar la pagina
    entera, y al salir de la lista vuelve el del scroll.
  */
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const shouldReduceMotion = useReducedMotion();
  /*
    Avance dentro del servicio activo, de 0 a 1: llena la linea de la
    fila activa y deja ver cuanto falta para pasar al siguiente. Motion
    value y no estado: cambia en cada frame y no debe re-renderizar.
  */
  const segmentProgress = useMotionValue(0);
  const segmentFill = useSpring(segmentProgress, {
    stiffness: 180,
    damping: 30,
    restDelta: 0.001,
  });

  const total = menuItems.length;

  /*
    La rueda devuelve el mando al scroll. Con el panel fijado la lista no
    se mueve bajo el cursor, asi que si el raton reposaba sobre una fila
    el hover la mantenia elegida y el servicio no cambiaba al bajar: la
    seccion parecia atascada.

    Soltar el hover no basta: mientras la pagina se desplaza, Chrome
    lanza `mousemove` sinteticos bajo un raton quieto para recalcular el
    hover. Cada uno volvia a elegir la fila y el panel parpadeaba entre
    el servicio del scroll y el del cursor.

    Y con un raton de verdad la mano lo mueve unos pixeles entre giro y
    giro de la rueda: movimientos reales, pero que no buscan otra fila.
    Por eso el hover se ignora del todo mientras se hace scroll (hasta
    SCROLL_QUIET_MS despues del ultimo giro) y, pasado ese tiempo, solo
    vuelve si el raton se aleja del punto donde estaba.
  */
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const scrollLockRef = useRef<{ x: number; y: number } | null>(null);
  const lastScrollInputRef = useRef(0);

  // Copia del hover para el listener de la rueda, que se registra una vez.
  const hoveredRef = useRef<number | null>(null);
  useEffect(() => {
    hoveredRef.current = hoveredIndex;
  }, [hoveredIndex]);

  /**
   * Posicion en el documento de un punto del tramo de un servicio:
   * `fraction` 0 es su inicio y 1 su final.
   */
  const segmentTop = useCallback(
    (index: number, fraction: number) => {
      const element = containerRef.current;
      if (!element) return null;
      const scrollable = element.offsetHeight - window.innerHeight;
      /*
        Posicion en el documento via rect + scrollY, no `offsetTop`: el
        offsetParent de este contenedor es la <section> `relative`, asi
        que offsetTop valia casi 0 y el salto caia al principio de la
        pagina en lugar de al tramo del servicio.
      */
      const documentTop = element.getBoundingClientRect().top + window.scrollY;
      return documentTop + (scrollable * (index + fraction)) / total;
    },
    [total],
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      lastScrollInputRef.current = performance.now();
      scrollLockRef.current = { x: event.clientX, y: event.clientY };

      /*
        El scroll sigue desde el servicio bajo el cursor. Con el raton en
        la ultima fila, girar la rueda no vuelve al servicio que marcaba
        el scroll: el scroll salta (sin animacion) al tramo de esa fila y
        avanza desde ahi. Al inicio del tramo si se baja y al final si se
        sube, para que el siguiente giro pase al servicio de al lado.

        Solo con la seccion fijada: ahi el salto no se ve, solo cambia el
        progreso. Fuera de ella moveria la pagina entera.
      */
      const hovered = hoveredRef.current;
      const element = containerRef.current;
      if (hovered !== null && element) {
        const rect = element.getBoundingClientRect();
        const pinned = rect.top <= 1 && rect.bottom >= window.innerHeight - 1;
        const target = segmentTop(hovered, event.deltaY > 0 ? 0.02 : 0.98);
        if (pinned && target !== null) {
          jumpScrollTo(target);
          setActiveIndex(hovered);
        }
      }

      hoveredRef.current = null;
      setHoveredIndex(null);
    };
    const onKeyDown = () => {
      lastScrollInputRef.current = performance.now();
      scrollLockRef.current = pointerRef.current ?? { x: -1, y: -1 };
      setHoveredIndex(null);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [segmentTop]);

  /** Hover de una fila, salvo que el movimiento sea sintetico. */
  const hoverRow = useCallback((index: number, event: React.MouseEvent) => {
    const point = { x: event.clientX, y: event.clientY };
    pointerRef.current = point;
    // Mientras dura el scroll (y la inercia de Lenis) manda la rueda.
    if (performance.now() - lastScrollInputRef.current < SCROLL_QUIET_MS) return;
    const lock = scrollLockRef.current;
    if (lock) {
      // Margen: la mano que suelta la rueda arrastra un poco el raton.
      const moved = Math.abs(point.x - lock.x) + Math.abs(point.y - lock.y);
      if (moved < 12) return;
      scrollLockRef.current = null;
    }
    setHoveredIndex(index);
  }, []);

  /*
    El indice se mide por frame mientras la seccion esta a la vista, en
    vez de escuchar el evento `scroll`.

    Con Lenis de por medio, un desplazamiento programatico (un ancla del
    menu, un scrollTo) mueve la pagina sin que llegue un `scroll` fiable,
    y el indice se quedaba congelado en el ultimo valor. Medir contra el
    rect no depende de como se haya producido el movimiento.

    El bucle solo corre mientras la seccion intersecta el viewport, y
    setActiveIndex con el mismo valor no provoca render en React, asi
    que el coste fuera de esta seccion es cero.
  */
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    let running = false;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const scrollable = element.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.999);
      const position = progress * total;
      setActiveIndex(Math.floor(position));
      segmentProgress.set(position - Math.floor(position));
    };

    const loop = () => {
      measure();
      frame = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !running) {
          running = true;
          loop();
        } else if (!entry.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(frame);
          measure();
        }
      },
      { threshold: 0 },
    );

    observer.observe(element);
    measure();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [total, segmentProgress]);

  /** Salta al tramo de scroll de un servicio concreto. */
  const goToIndex = useCallback(
    (index: number) => {
      const top = segmentTop(index, 0.5);
      // Via Lenis: un window.scrollTo se deshace en el frame siguiente.
      if (top !== null) smoothScrollTo(top);
    },
    [segmentTop],
  );

  const shownIndex = hoveredIndex ?? activeIndex;
  const active = menuItems[shownIndex] ?? menuItems[0];
  const activeCopy = t.services.items[shownIndex] ?? t.services.items[0];

  /*
    Entrada de la seccion: la lista llega fila a fila desde la izquierda
    y el panel sube desde abajo, una sola vez al aparecer. Luego manda el
    scroll (o el hover).
  */
  const enter = shouldReduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        whileInView: "show" as const,
        viewport: { once: true, amount: 0.35 },
      };

  return (
    <div
      ref={containerRef}
      /*
        60svh por servicio (antes 100): la seccion queda fijada la mitad
        de tiempo. Con el hover para saltar entre servicios ya no hace
        falta tanto recorrido, y el flujo de la pagina no se frena.
      */
      style={{ height: `${total * 60}svh` }}
      className="relative z-10 hidden desktop:block"
    >
      {/*
        `overflow-y-auto` como red de seguridad en ventanas bajas (un
        portatil de 700px de alto). Con raton no atrapa nada: Lenis
        gestiona la rueda sobre la ventana, no sobre este panel.
      */}
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-y-auto px-10 py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-10 flex items-end justify-between gap-4">
            <FadeSwap>
              <p className="mb-4 text-sm font-medium text-accent-ink">
                {t.services.eyebrow}
              </p>
              <h2 className="text-6xl font-semibold uppercase tracking-tight text-ink">
                <RevealWords text={t.services.title} />
              </h2>
            </FadeSwap>

            <p className="text-sm tabular-nums text-ink-subtle">
              {String(shownIndex + 1).padStart(2, "0")} /{" "}
              {String(total).padStart(2, "0")}
            </p>
          </div>

          <motion.div
            className="grid grid-cols-2 gap-14"
            {...enter}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07 } },
            }}
          >
            {/* Panel de detalle: diagrama arriba, texto del servicio abajo. */}
            {/*
              Cuadrado por debajo de xl: entre 1024 y 1280px la columna es
              estrecha y a 5/4 el texto de los servicios largos se salia
              por abajo del panel.
            */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 60, scale: 0.96 },
                show: {
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
                },
              }}
              className="relative order-2 flex aspect-square flex-col overflow-hidden xl:aspect-[5/4] rounded-2xl border border-tech-line bg-tech-bg transition-[background-color,border-color,color,box-shadow] duration-500">
              <div className="relative min-h-16 flex-1">
                {/* Sin modo "wait": el hover cambia rapido de servicio y
                    los diagramas se funden encima en vez de hacer cola. */}
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active.number}
                    className="absolute inset-0"
                    initial={
                      shouldReduceMotion ? false : { opacity: 0, scale: 1.04 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.45,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <TechVisual
                      id={active.diagram}
                      density="compact"
                      className="h-full"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Funde el diagrama con el bloque de texto de debajo. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-tech-bg to-transparent"
                />
              </div>

              <div className="relative shrink-0 p-6 xl:p-8">
                {/*
                  Solo entrada, sin salida: la key remonta el bloque y las
                  piezas suben escalonadas. Con AnimatePresence en modo
                  "wait", pasar rapido por tres servicios dejaba el texto
                  trabado en el primero. La key incluye el titulo para que
                  el cambio de idioma tambien releve.
                */}
                <motion.div
                  key={`${active.number}-${activeCopy.name}`}
                  variants={shouldReduceMotion ? undefined : panelTextVariants}
                  initial="hidden"
                  animate="show"
                >
                  <motion.p
                    variants={shouldReduceMotion ? undefined : panelLineVariants}
                    className="text-sm text-tech-accent"
                  >
                    {activeCopy.tag}
                  </motion.p>
                  <motion.p
                    variants={shouldReduceMotion ? undefined : panelLineVariants}
                    className="mt-2 text-2xl font-medium tracking-tight text-tech-ink xl:text-3xl"
                  >
                    {activeCopy.name}
                  </motion.p>
                  <motion.p
                    variants={shouldReduceMotion ? undefined : panelLineVariants}
                    className="mt-3 max-w-md text-base leading-relaxed text-tech-ink-soft"
                  >
                    {activeCopy.description}
                  </motion.p>
                </motion.div>
              </div>
            </motion.div>

            {/* Lista de servicios */}
            <motion.ul
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="order-1 flex flex-col"
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {menuItems.map((item, index) => {
                const isActive = index === shownIndex;
                const copy = t.services.items[index];

                return (
                  <motion.li
                    key={item.number}
                    variants={{
                      hidden: { opacity: 0, x: -32 },
                      show: {
                        opacity: 1,
                        x: 0,
                        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
                      },
                    }}
                  >
                    <button
                      type="button"
                      // Mover el raton y el foco eligen el servicio; el clic
                      // lleva el scroll hasta su tramo. onMouseMove y no
                      // onMouseEnter: tras girar la rueda, basta mover el
                      // raton sobre la misma fila para recuperar el hover.
                      onMouseMove={(event) => hoverRow(index, event)}
                      onFocus={() => setHoveredIndex(index)}
                      onBlur={() => setHoveredIndex(null)}
                      onClick={() => goToIndex(index)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "group relative flex w-full items-baseline border-t border-line py-3.5 text-left transition-colors duration-300 ease-[var(--ease-premium)]",
                        index === menuItems.length - 1 &&
                          "border-b border-line",
                      )}
                    >
                      {/*
                        Marcador de la fila activa: una barra de acento que
                        se desliza de fila en fila (layoutId) al bajar.
                      */}
                      {isActive ? (
                        <motion.span
                          layoutId="service-marker"
                          aria-hidden="true"
                          className="absolute -left-4 top-4 bottom-4 w-0.5 rounded-full bg-accent-ink"
                          transition={
                            shouldReduceMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 380, damping: 34 }
                          }
                        />
                      ) : null}

                      {/* Avance dentro del servicio activo, sobre el filete.
                          Solo cuando manda el scroll: con hover no hay
                          avance que mostrar. */}
                      {isActive && hoveredIndex === null && !shouldReduceMotion ? (
                        <motion.span
                          aria-hidden="true"
                          style={{ scaleX: segmentFill }}
                          className="absolute inset-x-0 -top-px h-px origin-left bg-accent-ink/70"
                        />
                      ) : null}

                      {/* La fila activa avanza un poco: se lee como elegida. */}
                      <motion.span
                        className="min-w-0 flex-1"
                        animate={{ x: isActive && !shouldReduceMotion ? 12 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 28 }}
                      >
                        <span
                          className={cn(
                            "block text-balance text-2xl tracking-tight transition-colors duration-300",
                            isActive
                              ? "font-medium text-ink"
                              : "text-ink-subtle group-hover:text-ink-muted",
                          )}
                        >
                          {copy.name}
                        </span>
                        <span
                          className={cn(
                            "mt-1.5 block text-sm transition-colors duration-300",
                            isActive
                              ? "text-accent-ink"
                              : "text-ink-subtle/60",
                          )}
                        >
                          {copy.tag}
                        </span>
                      </motion.span>
                    </button>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
