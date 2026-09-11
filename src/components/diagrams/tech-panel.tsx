import { cn } from "@/lib/utils";

interface TechPanelProps {
  /** Ruta de la barra de la ventana. */
  window: string;
  /** Texto de la insignia de estado. Sin el, no hay insignia. */
  status?: string;
  /** Borde y radio propios. Sin marco, rellena al contenedor que lo aloja. */
  framed?: boolean;
  /**
   * Oculta la barra por debajo de `sm`. En el panel de Servicios de un
   * movil el texto del servicio ocupa la mitad inferior, y la barra
   * empujaba el diagrama debajo de ese texto.
   */
  hideBarOnMobile?: boolean;
  /** Solo decorativo: el contenido ya se lee en otra parte. */
  decorative?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Carcasa de ventana de editor para diagramas y terminales.
 *
 * Sigue al tema con los tokens `tech-*` de globals.css: en oscuro es la
 * escala zinc de un editor oscuro; en claro, la de un editor claro.
 */
export function TechPanel({
  window,
  status,
  framed = true,
  hideBarOnMobile = false,
  decorative = false,
  className,
  children,
}: TechPanelProps) {
  return (
    <div
      aria-hidden={decorative || undefined}
      className={cn(
        "tech-grid relative flex w-full flex-col overflow-hidden bg-tech-bg text-tech-ink transition-[background-color,border-color,color,box-shadow] duration-500",
        framed &&
          "rounded-2xl border border-tech-line shadow-[var(--tech-shadow)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b border-tech-line bg-tech-bar px-4 py-2.5 transition-[background-color,border-color,color,box-shadow] duration-500",
          hideBarOnMobile && "hidden sm:flex",
        )}
      >
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-tech-dot" />
          <span className="size-2.5 rounded-full bg-tech-dot" />
          <span className="size-2.5 rounded-full bg-tech-dot" />
        </span>
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-tech-ink-subtle">
          {window}
        </p>
        {status ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-tech-status">
            <span
              aria-hidden="true"
              className="size-1.5 animate-pulse rounded-full bg-tech-ok"
            />
            {status}
          </span>
        ) : null}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
