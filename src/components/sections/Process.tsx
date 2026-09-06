import { Container } from "@/components/ui/Container";
import { LayeredStack } from "@/components/ui/LayeredStack";
import { Reveal } from "@/components/ui/Reveal";
import { processSteps, type ProcessStep } from "@/data/site";

/**
 * Demostracion de la directriz 3: las tarjetas se apilan con sticky
 * mientras el scroll avanza. La seccion es Server Component; solo
 * LayeredStack cruza al cliente.
 */
export function Process() {
  return (
    <section id="proceso" className="relative overflow-x-clip py-24 sm:py-32">
      <Container>
        <Reveal className="mb-14 max-w-2xl sm:mb-20">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Proceso
          </p>
          <h2 className="text-h2 font-medium text-balance text-ink">
            Cuatro pasos, ningun entregable decorativo.
          </h2>
          <p className="mt-5 text-lead text-pretty text-ink-muted">
            Cada fase existe para cerrar una fuga concreta. Si un paso no
            cambia lo que entra por tu embudo, no esta en esta lista.
          </p>
        </Reveal>
      </Container>

      <Container>
        <LayeredStack>
          {processSteps.map((step) => (
            <ProcessCard key={step.id} step={step} />
          ))}
        </LayeredStack>
      </Container>
    </section>
  );
}

function ProcessCard({ step }: { step: ProcessStep }) {
  return (
    <article className="rounded-3xl border border-line-strong bg-surface p-7 sm:p-12">
      <div className="hairline-top mb-8 h-px w-full" aria-hidden="true" />

      <div className="flex flex-col gap-8 sm:flex-row sm:gap-14">
        <p className="font-mono text-sm text-accent sm:pt-2">{step.index}</p>

        <div className="min-w-0 flex-1">
          <h3 className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
            {step.title}
          </h3>

          <dl className="mt-8 grid gap-8 sm:grid-cols-2">
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-ink-subtle">
                El problema
              </dt>
              <dd className="mt-3 text-pretty text-ink-muted">{step.pain}</dd>
            </div>
            <div className="min-w-0">
              <dt className="text-xs font-medium uppercase tracking-[0.16em] text-accent">
                Lo que te llevas
              </dt>
              <dd className="mt-3 text-pretty text-ink">{step.promise}</dd>
            </div>
          </dl>
        </div>
      </div>
    </article>
  );
}
