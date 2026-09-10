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
 * Es oscura en los dos temas a proposito, como una captura de un IDE:
 * los colores son la escala zinc literal y el acento `tech-accent`, no
 * los tokens del tema, que en claro darian texto oscuro sobre oscuro.
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
        "tech-grid relative flex w-full flex-col overflow-hidden bg-zinc-950 text-zinc-100",
        framed &&
          "rounded-2xl border border-zinc-800 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.6)]",
        className,
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center gap-3 border-b border-zinc-800 bg-zinc-900/80 px-4 py-2.5",
          hideBarOnMobile && "hidden sm:flex",
        )}
      >
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
          <span className="size-2.5 rounded-full bg-zinc-700" />
        </span>
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] text-zinc-500">
          {window}
        </p>
        {status ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-emerald-300">
            <span
              aria-hidden="true"
              className="size-1.5 animate-pulse rounded-full bg-emerald-400"
            />
            {status}
          </span>
        ) : null}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
