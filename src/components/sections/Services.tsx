import { FadeIn } from "@/components/ui/FadeIn";
import { services } from "@/data/site";

/**
 * Hoja de alto contraste: fondo blanco sobre el resto oscuro.
 * Server Component; solo los FadeIn cruzan al cliente.
 */
export function Services() {
  return (
    <section
      id="services"
      className="relative z-0 overflow-x-clip rounded-t-[40px] bg-white px-5 py-20 sm:rounded-t-[50px] sm:px-8 md:rounded-t-[60px] md:px-10"
    >
      <h2
        className="text-center font-black uppercase leading-none tracking-tight text-[#0C0C0C]"
        style={{ fontSize: "clamp(3rem, 12vw, 160px)" }}
      >
        Services
      </h2>

      <div className="mx-auto mt-16 w-full max-w-6xl">
        {services.map((service, index) => (
          <FadeIn key={service.number} delay={0.05 * index}>
            <article
              className="flex flex-col gap-4 py-10 sm:flex-row sm:items-start sm:gap-12"
              style={{
                borderTop:
                  index === 0 ? undefined : "1px solid rgba(12, 12, 12, 0.15)",
              }}
            >
              <p
                className="font-black leading-none tracking-tight text-[#0C0C0C]"
                style={{ fontSize: "clamp(3rem, 10vw, 140px)" }}
              >
                {service.number}
              </p>

              <div className="min-w-0 flex-1 sm:pt-3">
                <h3 className="text-2xl font-medium tracking-tight text-[#0C0C0C] sm:text-3xl">
                  {service.name}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#0C0C0C]/70">
                  {service.description}
                </p>
                <p className="mt-4 font-mono text-xs uppercase tracking-wider text-[#0C0C0C]/50">
                  {service.stack}
                </p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
