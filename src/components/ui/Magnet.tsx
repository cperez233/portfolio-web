"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MagnetProps {
  children: React.ReactNode;
  className?: string;
  /** Radio extra alrededor del elemento donde ya reacciona, en px. */
  padding?: number;
  /** Divisor del desplazamiento: mas alto = imán mas sutil. */
  strength?: number;
}

/**
 * Sigue al cursor con fisica elastica usando translate3d.
 *
 * Se desactiva con prefers-reduced-motion y en dispositivos sin puntero
 * fino: en tactil no hay hover, y el listener seria peso muerto.
 */
export function Magnet({
  children,
  className,
  padding = 150,
  strength = 3,
}: MagnetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    const handleMove = (event: MouseEvent) => {
      const element = ref.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = event.clientX - centerX;
      const distanceY = event.clientY - centerY;

      const inRangeX = Math.abs(distanceX) < rect.width / 2 + padding;
      const inRangeY = Math.abs(distanceY) < rect.height / 2 + padding;

      if (inRangeX && inRangeY) {
        setOffset({ x: distanceX / strength, y: distanceY / strength });
      } else {
        setOffset({ x: 0, y: 0 });
      }
    };

    window.addEventListener("mousemove", handleMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMove);
  }, [padding, strength, shouldReduceMotion]);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition: "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
