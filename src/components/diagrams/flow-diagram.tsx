"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpDown,
} from "lucide-react";
import type { DiagramNode } from "@/data/diagrams";
import type { DiagramCopy } from "@/data/content";
import { cn } from "@/lib/utils";
import { DiagramIconGlyph } from "./diagram-icon";
import { revealItem } from "./motion";

interface FlowDiagramProps {
  columns: DiagramNode[][];
  copy: DiagramCopy;
  bidirectional?: boolean;
  /**
   * `full`: nodos con detalle y etiqueta en cada tramo; en columna por
   * debajo de `md`, en fila desde ahi.
   * `compact`: una fila de fichas, para acompanar al texto de Servicios.
   */
  density: "compact" | "full";
}

/**
 * Diagrama de flujo por columnas. Una columna con varios nodos es un
 * abanico: el tramo que llega a ella reparte hacia todos (PairSync:
 * Laravel habla con LangGraph, Moodle y la base de datos).
 */
export function FlowDiagram({
  columns,
  copy,
  bidirectional = false,
  density,
}: FlowDiagramProps) {
  if (density === "compact") {
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        {columns.map((column, index) => (
          <Fragment key={index}>
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "flow-line-x h-px min-w-3 flex-1",
                  bidirectional && "is-bidirectional",
                )}
              />
            ) : null}
            <div className="flex min-w-0 flex-col gap-1.5">
              {column.map((node) => (
                <CompactNode key={node.id} node={node} copy={copy} />
              ))}
            </div>
          </Fragment>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch md:flex-row md:items-center">
      {columns.map((column, index) => (
        <Fragment key={index}>
          {index > 0 ? (
            <Connector
              label={copy.links?.[index - 1]}
              bidirectional={bidirectional}
            />
          ) : null}
          <div
            className={cn(
              "flex min-w-0 flex-col gap-2 md:flex-1",
              // El filo izquierdo agrupa el abanico como un solo destino;
              // `flow-fan` lo compacta si la tarjeta es baja.
              column.length > 1 &&
                "flow-fan md:border-l md:border-zinc-800 md:pl-3",
            )}
          >
            {column.map((node) => (
              <FullNode key={node.id} node={node} copy={copy} />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

function FullNode({ node, copy }: { node: DiagramNode; copy: DiagramCopy }) {
  const text = copy.nodes?.[node.id];

  return (
    <motion.div
      variants={revealItem}
      className="flow-node flex min-w-0 items-start gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 px-3 py-2.5"
    >
      <span className="flow-node-icon inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-tech-accent/25 bg-tech-accent/10 text-tech-accent">
        <DiagramIconGlyph icon={node.icon} className="size-3.5" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium leading-tight text-zinc-100">
          {text?.title ?? node.id}
        </span>
        {text?.detail ? (
          <span className="flow-detail mt-1 block text-xs leading-snug text-zinc-400">
            {text.detail}
          </span>
        ) : null}
      </span>
    </motion.div>
  );
}

function CompactNode({
  node,
  copy,
}: {
  node: DiagramNode;
  copy: DiagramCopy;
}) {
  const text = copy.nodes?.[node.id];

  return (
    <motion.div
      variants={revealItem}
      className="flex min-w-0 items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900/90 p-1.5 sm:pr-2.5 lg:items-start lg:py-2"
    >
      <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-tech-accent/10 text-tech-accent">
        <DiagramIconGlyph icon={node.icon} className="size-3.5" />
      </span>
      {/* En movil solo el icono: el nombre ya esta en el texto de abajo. */}
      <span className="hidden min-w-0 sm:block">
        <span className="block truncate text-[11px] font-medium leading-tight text-zinc-200 lg:text-xs">
          {text?.title ?? node.id}
        </span>
        {text?.detail ? (
          <span className="mt-0.5 hidden truncate text-[10px] leading-tight text-zinc-500 lg:block">
            {text.detail}
          </span>
        ) : null}
      </span>
    </motion.div>
  );
}

/**
 * Tramo entre columnas: trazo animado, flecha y etiqueta del protocolo.
 * En movil va en vertical, alineado bajo el icono del nodo de arriba; en
 * fila la etiqueta sube encima del trazo.
 */
function Connector({
  label,
  bidirectional,
}: {
  label?: string;
  bidirectional: boolean;
}) {
  const VerticalArrow = bidirectional ? ArrowUpDown : ArrowDown;
  const HorizontalArrow = bidirectional ? ArrowLeftRight : ArrowRight;

  return (
    <div className="flex shrink-0 items-center gap-2 py-1 pl-[25px] md:w-16 md:flex-col md:items-stretch md:gap-1 md:px-1.5 md:py-0 lg:w-24">
      {label ? (
        <span className="order-last font-mono text-[10px] leading-tight text-zinc-500 md:order-first md:text-center">
          {label}
        </span>
      ) : null}
      <span aria-hidden="true" className="flex items-center gap-1">
        <span
          className={cn(
            "flow-line-y h-6 w-px md:hidden",
            bidirectional && "is-bidirectional",
          )}
        />
        <span
          className={cn(
            "flow-line-x hidden h-px flex-1 md:block",
            bidirectional && "is-bidirectional",
          )}
        />
        <VerticalArrow className="size-3 text-zinc-500 md:hidden" />
        <HorizontalArrow className="hidden size-3 shrink-0 text-zinc-500 md:block" />
      </span>
    </div>
  );
}
