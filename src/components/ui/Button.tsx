import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

interface ButtonProps {
  children: React.ReactNode;
  /** Si se pasa, renderiza un enlace en lugar de un boton. */
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  type?: "button" | "submit";
}

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-canvas font-medium hover:bg-accent-strong active:bg-accent",
  secondary:
    "border border-line-strong bg-surface-2/80 text-ink hover:bg-surface-3 hover:border-line-strong",
  ghost: "text-ink-muted hover:text-ink hover:bg-surface-2/60",
};

const sizes: Record<Size, string> = {
  // Directriz 6: min-h de 44px para targets tactiles
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

/**
 * Directriz 4: estados hover/focus/active definidos y transicion de 200ms.
 * Sin `use client`: no lleva handlers, asi que se queda en el servidor.
 */
export function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  className,
  type = "button",
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-full",
    "transition-[background-color,border-color,color,transform] duration-200 ease-[var(--ease-premium)]",
    "active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes}>
      {children}
    </button>
  );
}
