import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { hero } from "@/data/site";

/**
 * Server Component: no tiene estado propio. La interactividad la aportan
 * los <Reveal> cliente que envuelve (directriz 5).
 *
 * Directriz 2: el titular nombra el dolor, el subtitulo identifica a la
 * persona y cierra con la promesa.
 */
export function Hero() {
  return (
    <section className="relative overflow-x-clip pt-16 pb-24 sm:pt-24 sm:pb-32">
      {/* Glow decorativo. No participa del layout ni del scroll horizontal. */}
      <div
        aria-hidden="true"
        className="glow-accent pointer-events-none absolute -top-32 left-1/2 -z-10 h-[36rem] w-[min(64rem,120vw)] -translate-x-1/2"
      />

      <Container>
        <Reveal>
          <Badge dot>{hero.eyebrow}</Badge>
        </Reveal>

        <Reveal delay={0.08}>
          <h1 className="mt-8 max-w-4xl text-display font-medium text-balance text-ink">
            {hero.headline}
          </h1>
        </Reveal>

        <Reveal delay={0.16}>
          <p className="mt-7 max-w-2xl text-lead text-pretty text-ink-muted">
            {hero.subheadline}
          </p>
        </Reveal>

        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button href={hero.secondaryCta.href} variant="secondary" size="lg">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
