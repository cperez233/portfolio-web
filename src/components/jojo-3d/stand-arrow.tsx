"use client";

import { useRef } from "react";
import { useLanguage } from "@/lib/language";
import { emitStandEvent } from "@/lib/stand-events";
import { unlockSecret } from "@/lib/secrets";
import { cn } from "@/lib/utils";
import { useLazyScene } from "./use-lazy-scene";

/**
 * La Flecha en 3D, junto a la tarjeta de Stand: la que en JoJo despierta
 * los Stands. Al tocarla se lanza hacia la tarjeta, que se "despierta"
 * (sacudida y destello, ver .stand-awaken en globals.css).
 */
export function StandArrow({ className }: { className?: string }) {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { ready } = useLazyScene(canvasRef, async (canvas, reducedMotion) => {
    const { createArrowScene } = await import("./arrow-scene");
    return createArrowScene({
      canvas,
      reducedMotion,
      onPierce: () => {
        emitStandEvent("arrow");
        unlockSecret("arrow");
        // El impacto llega cuando la punta alcanza la tarjeta.
        window.setTimeout(() => {
          const card = document.querySelector("[data-spot='standcard']");
          card?.classList.remove("stand-awaken");
          void (card as HTMLElement | null)?.offsetWidth;
          card?.classList.add("stand-awaken");
        }, 380);
      },
    });
  });

  const label =
    language === "es"
      ? "La Flecha de JoJo en 3D. Arrástrala para girarla, tócala para lanzarla."
      : "JoJo's Arrow in 3D. Drag to spin it, tap to throw it.";

  return (
    <div className={cn("relative", className)}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className={cn(
          "arena-canvas block size-full cursor-pointer transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}
