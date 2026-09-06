"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { navLinks, site } from "@/data/site";
import { cn } from "@/lib/utils";

/**
 * Cliente por el estado de scroll y el menu movil.
 * El menu movil NO bloquea el scroll del body (directriz 3): se despliega
 * en flujo y el usuario siempre puede salir deslizando.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-200 ease-[var(--ease-premium)]",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <Container>
        <nav className="flex min-h-16 items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-medium tracking-tight text-ink"
          >
            {site.name}
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center rounded-full px-4 text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden md:block">
            <Button href="#contacto" size="md">
              Hablemos
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="menu-movil"
            aria-label={open ? "Cerrar menu" : "Abrir menu"}
            className="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink-muted transition-colors duration-200 hover:text-ink md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </nav>
      </Container>

      {open ? (
        <div
          id="menu-movil"
          className="border-t border-line bg-canvas/95 backdrop-blur-md md:hidden"
        >
          <Container>
            <ul className="flex flex-col py-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex min-h-12 items-center text-base text-ink-muted transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="py-3">
                <Button href="#contacto" size="lg" className="w-full">
                  Hablemos
                </Button>
              </li>
            </ul>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
