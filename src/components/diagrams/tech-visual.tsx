"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { diagrams, type DiagramId } from "@/data/diagrams";
import { useLanguage } from "@/lib/language";
import { cn } from "@/lib/utils";
import { FlowDiagram } from "./flow-diagram";
import { revealContainer } from "./motion";
import { TechPanel } from "./tech-panel";
import { TerminalLog } from "./terminal-log";

interface TechVisualProps {
  id: DiagramId;
  /**
   * `full`: tarjetas de proyecto, con detalle en cada nodo y etiquetas
   * de tramo. `compact`: panel de Servicios, donde el texto del servicio
   * ocupa la mitad inferior y el diagrama solo acompana.
   */
  density?: "compact" | "full";
  className?: string;
}

/**
 * Punto de entrada unico: compone carcasa, flujo y terminal a partir de
 * data/diagrams.ts (estructura) y content.ts (textos del idioma activo).
 */
export function TechVisual({
  id,
  density = "full",
  className,
}: TechVisualProps) {
  const spec = diagrams[id];
  const { t } = useLanguage();
  const copy = t.diagrams[id];
  const shouldReduceMotion = useReducedMotion();
  const compact = density === "compact";

  /*
    En Servicios el panel se remonta con cada cambio de servicio (lleva
    `key` dentro de un AnimatePresence), asi que se anima al montar. En
    Proyectos se anima la primera vez que entra en pantalla.
  */
  const reveal: HTMLMotionProps<"div"> = shouldReduceMotion
    ? { initial: false }
    : compact
      ? { initial: "hidden", animate: "visible" }
      : {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, amount: 0.3 },
        };

  return (
    <TechPanel
      window={spec.window}
      status={copy.status}
      framed={!compact}
      hideBarOnMobile={compact}
      decorative={compact}
      className={className}
    >
      <motion.div
        variants={revealContainer}
        {...reveal}
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          // Contenedor de las container queries de globals.css. Sin
          // relleno propio: una container query no puede tocar al
          // contenedor, solo a lo de dentro, y el relleno es lo primero
          // que hay que recortar cuando la tarjeta es baja.
          !compact && "tech-stage",
        )}
      >
        <div
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            compact ? "gap-3 p-2.5 sm:p-4" : "tech-stage-inner gap-4 p-4 sm:p-5",
            // Se centra en el alto libre: siempre en Servicios, y en
            // Proyectos cuando no hay terminal que ocupe la parte de abajo.
            (compact || !spec.terminal) && "justify-center",
          )}
        >
        {spec.flow ? (
          <FlowDiagram
            columns={spec.flow.columns}
            bidirectional={spec.flow.bidirectional}
            copy={copy}
            density={density}
          />
        ) : null}

        {spec.terminal ? (
          <TerminalLog
            lines={spec.terminal}
            log={copy.log ?? []}
            maxLines={compact ? 3 : undefined}
            showCaret={!compact}
            className={compact ? "p-2 text-[10px] sm:p-2.5 sm:text-[11px]" : "min-h-0 flex-1"}
          />
        ) : null}
        </div>
      </motion.div>
    </TechPanel>
  );
}
