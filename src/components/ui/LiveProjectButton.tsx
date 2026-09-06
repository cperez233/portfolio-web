import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface LiveProjectButtonProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

/** Ghost button con borde #D7E2EA. */
export function LiveProjectButton({
  children,
  href,
  className,
}: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#D7E2EA] px-5",
        "text-xs uppercase tracking-wider text-[#D7E2EA] sm:text-sm",
        "transition-colors duration-200 ease-[var(--ease-premium)] hover:bg-[#D7E2EA] hover:text-[#0c0c0c]",
        className,
      )}
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}
