import { cn } from "@/lib/utils";

interface ContactButtonProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  /** Abre en pestana nueva con rel de seguridad. */
  external?: boolean;
}

/**
 * Boton pildora con el gradiente multicapa de alta gama.
 * Server Component: es un enlace sin estado.
 */
export function ContactButton({
  children,
  href,
  className,
  external = false,
}: ContactButtonProps) {
  return (
    <a
      href={href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-medium uppercase tracking-wider text-white",
        "transition-transform duration-200 ease-[var(--ease-premium)] hover:scale-[1.03] active:scale-[0.98]",
        className,
      )}
      style={{
        background:
          "linear-gradient(123deg, #18011F 7%, #B600A8 37%, #7621B0 72%, #BE4C00 100%)",
        outline: "2px solid rgba(255, 255, 255, 0.9)",
        outlineOffset: "-3px",
        boxShadow: "inset 0 2px 18px rgba(118, 33, 176, 0.65)",
      }}
    >
      {children}
    </a>
  );
}
