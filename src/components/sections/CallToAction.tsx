import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { cta, site } from "@/data/site";

export function CallToAction() {
  return (
    <section id="contacto" className="relative overflow-x-clip py-24 sm:py-32">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl border border-line-strong bg-surface p-8 sm:p-16">
            <div
              aria-hidden="true"
              className="glow-accent pointer-events-none absolute -top-24 right-0 h-96 w-96"
            />

            <div className="relative max-w-2xl">
              <h2 className="text-h2 font-medium text-balance text-ink">
                {cta.headline}
              </h2>
              <p className="mt-6 text-lead text-pretty text-ink-muted">
                {cta.body}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button href={`mailto:${site.email}`} size="lg">
                  {cta.action.label}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Button>
                <a
                  href={`mailto:${site.email}`}
                  className="inline-flex min-h-11 items-center text-sm text-ink-muted transition-colors duration-200 hover:text-ink"
                >
                  {site.email}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
