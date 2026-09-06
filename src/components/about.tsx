import { AnimatedText } from "@/components/ui/AnimatedText";
import { FadeIn } from "@/components/ui/FadeIn";
import { aboutBlocks, aboutHighlights } from "@/data/site";

/**
 * About editorial: dos bloques tematicos y una rejilla de datos clave.
 * Sin assets 3D ni iconos de esquina; el peso lo llevan el aire y la
 * jerarquia tipografica.
 */
export function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-x-clip bg-canvas px-5 py-24 transition-colors duration-300 sm:px-8 sm:py-28 md:px-10"
    >
      <div className="mx-auto w-full max-w-6xl">
        <FadeIn>
          <p className="mb-5 font-mono text-xs uppercase tracking-[0.28em] text-accent-ink">
            [ 01 ] About
          </p>
          <h2 className="max-w-3xl text-section font-semibold uppercase text-ink">
            About me
          </h2>
          <div className="hairline mt-10 h-px w-full" />
        </FadeIn>

        {/* Dos columnas editoriales */}
        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {aboutBlocks.map((block, index) => (
            <FadeIn key={block.eyebrow} delay={0.1 + index * 0.08}>
              <article>
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-accent-ink">
                    {block.eyebrow}
                  </span>
                  <h3 className="text-xl font-medium tracking-tight text-ink sm:text-2xl">
                    {block.title}
                  </h3>
                </div>

                <AnimatedText
                  text={block.body}
                  className="mt-6 text-lead text-ink-muted"
                />
              </article>
            </FadeIn>
          ))}
        </div>

        {/* Micro-tarjetas de datos clave */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {aboutHighlights.map((item, index) => (
            <FadeIn key={item.label} delay={0.05 * index}>
              <div className="h-full bg-surface p-6 transition-colors duration-300">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent-ink">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <p className="mt-4 text-base font-medium tracking-tight text-ink">
                  {item.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-subtle">
                  {item.detail}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
