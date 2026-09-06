import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Une clases de Tailwind resolviendo conflictos (la ultima gana).
 * Directriz 5: unica via permitida para componer className.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
