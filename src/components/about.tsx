import { AnimatedText } from "@/components/ui/AnimatedText";
import { FadeIn } from "@/components/ui/FadeIn";
import { aboutText } from "@/data/site";

/**
 * About sobrio: sin assets 3D ni iconos de esquina. Todo el peso lo
 * llevan el aire, la jerarquia tipografica y el revelado del texto.
 *
 * Server Component; solo FadeIn y AnimatedText cruzan al cliente.
 */
export function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-svh items-center overflow-x-clip px-5 py-28 sm:px-8 md:px-10"
    >
      <div className="mx-auto w-full max-w-4xl">
        <FadeIn>
          <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.28em] text-accent">
            [ 01 ]
          </p>
          <h2 className="text-center text-section font-semibold uppercase text-ink">
            About me
          </h2>
          <div className="hairline mx-auto mt-10 h-px w-full max-w-xs" />
        </FadeIn>

        <AnimatedText
          text={aboutText}
          className="mx-auto mt-12 max-w-3xl text-left text-lead text-ink-muted sm:mt-16"
        />
      </div>
    </section>
  );
}
