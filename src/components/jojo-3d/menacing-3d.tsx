"use client";

import { useRef } from "react";
import { Menacing } from "@/components/ui/menacing";
import { cn } from "@/lib/utils";
import { useLazyScene } from "./use-lazy-scene";

/**
 * ゴゴゴ en 3D. Mientras carga three.js, o si no hay WebGL, se ve el ゴゴゴ
 * de texto de siempre en el mismo sitio.
 */
export function Menacing3D({ className, fallbackSize = "2.6rem" }: { className?: string; fallbackSize?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ready } = useLazyScene(canvasRef, async (canvas, reducedMotion) => {
    const { createMenacingScene } = await import("./menacing-scene");
    return createMenacingScene({ canvas, reducedMotion });
  });

  return (
    <div className={cn("relative", className)}>
      {ready ? null : <Menacing size={fallbackSize} className="absolute inset-0 m-auto" />}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn("block size-full cursor-pointer transition-opacity duration-700", ready ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}
