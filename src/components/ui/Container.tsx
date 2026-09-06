import { cn } from "@/lib/utils";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  /** `wide` para secciones que respiran, `narrow` para bloques de lectura. */
  width?: "default" | "wide" | "narrow";
}

const widths = {
  default: "max-w-6xl",
  wide: "max-w-7xl",
  narrow: "max-w-3xl",
} as const;

/**
 * Unico contenedor horizontal del sitio.
 * Directriz 7: el padding lateral vive aqui, asi ninguna seccion
 * inventa su propio margen y se sale del viewport.
 */
export function Container({
  children,
  className,
  width = "default",
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-5 sm:px-8", widths[width], className)}>
      {children}
    </div>
  );
}
