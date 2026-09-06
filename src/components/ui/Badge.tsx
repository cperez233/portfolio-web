import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  /** Punto pulsante a la izquierda, para estados tipo "disponible". */
  dot?: boolean;
}

export function Badge({ children, className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1.5",
        "text-xs font-medium tracking-wide text-ink-muted backdrop-blur-sm",
        className,
      )}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-accent"
        />
      ) : null}
      {children}
    </span>
  );
}
