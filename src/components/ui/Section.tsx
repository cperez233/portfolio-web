import { cn } from "@/lib/utils";
import { Container } from "./Container";
import { Reveal } from "./Reveal";

interface SectionProps {
  children: React.ReactNode;
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  /** Contenedor interno; `none` para secciones que gestionan su propio ancho. */
  width?: "default" | "wide" | "narrow" | "none";
}

/**
 * Envoltorio estandar de seccion.
 * Directriz 7: `overflow-x-clip` aqui y no en body, para que los efectos
 * decorativos no generen scroll horizontal sin romper el sticky.
 */
export function Section({
  children,
  id,
  eyebrow,
  title,
  description,
  className,
  width = "default",
}: SectionProps) {
  const header = eyebrow || title || description;

  const content = (
    <>
      {header ? (
        <Reveal className="mb-14 max-w-2xl sm:mb-20">
          {eyebrow ? (
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-h2 font-medium text-balance text-ink">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-5 text-lead text-pretty text-ink-muted">
              {description}
            </p>
          ) : null}
        </Reveal>
      ) : null}
      {children}
    </>
  );

  return (
    <section
      id={id}
      className={cn("relative overflow-x-clip py-24 sm:py-32", className)}
    >
      {width === "none" ? content : <Container width={width}>{content}</Container>}
    </section>
  );
}
