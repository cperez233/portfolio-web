"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { menuItems, type ServiceItem } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { FadeSwap } from "./FadeSwap";
import { cn } from "@/lib/utils";

/**
 * Scroller de servicios con scroll-lock aparente.
 *
 * El contenedor mide una pantalla por servicio y el panel interior va
 * `sticky`: la seccion parece quedarse quieta mientras el progreso del
 * scroll cambia el servicio activo. El scroll nativo nunca se
 * intercepta, asi que el usuario siempre puede salir.
 */
export default function InteractiveVideoScroller() {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const total = menuItems.length;
  const hasVideo = menuItems.some((item) => item.video);

  useEffect(() => {
    const handleScroll = () => {
      const element = containerRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const scrollable = element.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const progress = Math.min(Math.max(-rect.top / scrollable, 0), 0.999);
      setActiveIndex(Math.floor(progress * total));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [total]);

  /** Salta al tramo de scroll de un servicio concreto. */
  const goToIndex = useCallback(
    (index: number) => {
      const element = containerRef.current;
      if (!element) return;

      const scrollable = element.offsetHeight - window.innerHeight;
      const top = element.offsetTop + (scrollable * (index + 0.5)) / total;
      window.scrollTo({ top });
    },
    [total],
  );

  const active = menuItems[activeIndex] ?? menuItems[0];
  const activeName = t.services.items[activeIndex] ?? t.services.items[0];

  return (
    <section
      id="services"
      className="overflow-x-clip bg-surface transition-colors duration-300"
    >
      <div
        ref={containerRef}
        style={{ height: `${total * 100}svh` }}
        className="relative"
      >
        <div className="sticky top-0 flex h-svh flex-col justify-center px-5 py-16 sm:px-8 md:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-8 flex items-end justify-between gap-4 sm:mb-12">
              <FadeSwap>
                <p className="mb-4 font-mono text-xs uppercase tracking-[0.28em] text-accent-ink">
                  {t.services.eyebrow}
                </p>
                <h2 className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl">
                  {t.services.title}
                </h2>
              </FadeSwap>

              <p className="hidden font-mono text-xs uppercase tracking-wider text-ink-subtle sm:block">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(total).padStart(2, "0")}
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
              {/* Panel de medios */}
              <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-2xl border border-line bg-surface-2 lg:order-2 lg:aspect-[5/4]">
                <MediaPanel
                  item={active}
                  name={activeName}
                  stack={active.location}
                  isMuted={isMuted}
                />

                {hasVideo ? (
                  <button
                    type="button"
                    onClick={() => setIsMuted((value) => !value)}
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                    className="absolute bottom-4 right-4 inline-flex size-11 items-center justify-center rounded-full border border-line-strong bg-canvas/70 text-ink backdrop-blur-sm transition-colors duration-200 hover:border-accent hover:text-accent-ink"
                  >
                    {isMuted ? (
                      <VolumeX className="size-4" />
                    ) : (
                      <Volume2 className="size-4" />
                    )}
                  </button>
                ) : null}
              </div>

              {/* Lista de servicios */}
              <ul className="order-2 flex flex-col lg:order-1">
                {menuItems.map((item, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <li key={item.number}>
                      <button
                        type="button"
                        onClick={() => goToIndex(index)}
                        aria-current={isActive ? "true" : undefined}
                        className={cn(
                          "flex w-full items-baseline gap-4 border-t border-line py-4 text-left transition-colors duration-300 ease-[var(--ease-premium)] sm:gap-6 sm:py-5",
                          index === menuItems.length - 1 &&
                            "border-b border-line",
                        )}
                      >
                        <span
                          className={cn(
                            "shrink-0 font-mono text-xs transition-colors duration-300",
                            isActive ? "text-accent-ink" : "text-ink-subtle",
                          )}
                        >
                          {item.number}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span
                            className={cn(
                              "block text-lg tracking-tight transition-colors duration-300 sm:text-2xl",
                              isActive
                                ? "font-medium text-ink"
                                : "text-ink-subtle",
                            )}
                          >
                            {t.services.items[index]}
                          </span>
                          <span
                            className={cn(
                              "mt-1 block font-mono text-[11px] uppercase tracking-wider transition-colors duration-300",
                              isActive
                                ? "text-accent-ink"
                                : "text-ink-subtle/60",
                            )}
                          >
                            {item.location}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Reproduce el video del servicio si existe; mientras no haya fuentes,
 * muestra la miniatura tematica en el mismo hueco.
 */
function MediaPanel({
  item,
  name,
  stack,
  isMuted,
}: {
  item: ServiceItem;
  name: string;
  stack: string;
  isMuted: boolean;
}) {
  if (item.video) {
    return (
      <video
        key={item.video}
        src={item.video}
        autoPlay
        loop
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <>
      <Image
        key={item.image}
        src={item.image}
        alt=""
        aria-hidden="true"
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover"
      />
      {/* Velo para que el texto se lea sobre cualquier foto. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"
      />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent-ink">
          {stack}
        </p>
        <p className="mt-2 text-xl italic text-white sm:text-2xl">{name}</p>
      </div>
    </>
  );
}
