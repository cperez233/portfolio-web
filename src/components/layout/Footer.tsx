import { Container } from "@/components/ui/Container";
import { navLinks, site } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-x-clip border-t border-line py-14">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-ink">{site.name}</p>
            <p className="mt-2 max-w-xs text-sm text-ink-subtle">{site.role}</p>
          </div>

          <nav aria-label="Pie de pagina">
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex min-h-11 items-center text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-subtle sm:flex-row sm:justify-between">
          <p>
            {year} {site.name}
          </p>
          <p>{site.location}</p>
        </div>
      </Container>
    </footer>
  );
}
