"use client";

import { useEffect, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";
import { ArrowDown, ArrowUpRight, Check } from "lucide-react";
import { brandKit, currency, fullAudit, formatPrice, plans, type Plan, type PlanKey } from "@/data/site";
import { useLanguage } from "@/lib/language";
import { buildWhatsappUrl, trackWhatsappClick } from "@/lib/contact";
import { FadeIn } from "@/components/ui/FadeIn";
import { FadeSwap } from "@/components/ui/FadeSwap";
import { SectionEdge } from "@/components/ui/section-transition";
import { RevealWords } from "@/components/ui/reveal-words";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/** Lista de lo que incluye un plan: entra punto por punto. */
const featureList: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const featureItem: Variants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
};

/**
 * Precios de referencia: tres planes con "desde", una fila para lo que
 * se cotiza y lo que el cliente paga aparte (dominio y hosting).
 *
 * En celular, un plan a la vez con un selector: apiladas, las tres
 * tarjetas median mas de tres pantallas. Se cambia tocando el selector o
 * deslizando la tarjeta. Desde lg, las tres en columnas.
 *
 * Cada boton abre WhatsApp con el plan ya nombrado.
 */
export function PricingSection() {
  const { t, language } = useLanguage();
  const copy = t.pricing;

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      // Hoja que se monta sobre el final de Proyectos, como las demas
      // secciones con esquinas: capas, no bloques planos uno tras otro.
      className="layer-top relative z-30 -mt-8 overflow-x-clip rounded-t-[32px] bg-canvas px-5 py-20 transition-colors duration-500 sm:rounded-t-[48px] sm:px-8 sm:py-28 md:px-10"
    >
      <SectionEdge />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <FadeIn className="mb-10 sm:mb-14">
          <FadeSwap>
            <p className="mb-4 text-sm font-medium text-accent-ink">{copy.eyebrow}</p>
            <h2
              id="pricing-title"
              className="text-4xl font-semibold uppercase tracking-tight text-ink sm:text-6xl"
            >
              <RevealWords text={copy.title} />
            </h2>
            <p className="mt-4 max-w-xl text-lead text-ink-muted">{copy.intro}</p>
          </FadeSwap>
        </FadeIn>

        <MobilePlans />

        <ul className="hidden gap-6 lg:grid lg:grid-cols-3">
          {plans.map((plan, index) => (
            <li key={plan.key} className="flex">
              <FadeIn delay={0.08 * index} y={32} className="flex w-full">
                <motion.div
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 400, damping: 24 }}
                  className="flex w-full"
                >
                  <PlanCard plan={plan} index={index} idPrefix="plan" />
                </motion.div>
              </FadeIn>
            </li>
          ))}
        </ul>

        {/*
          Lo que va aparte: la app a medida (se cotiza) y el kit de marca
          (precio propio, mas barato sumado a un plan). Filas, no una
          cuarta y quinta tarjeta.
        */}
        <div className="mt-5 grid gap-4 lg:mt-6 lg:grid-cols-2 lg:gap-6">
          <AddonRow
            name={copy.custom.name}
            summary={copy.custom.summary}
            cta={copy.custom.cta}
            message={copy.custom.whatsappMessage}
            location="pricing-custom"
          />
          <AddonRow
            name={copy.brand.name}
            summary={copy.brand.summary
              .replace("{price}", formatPrice(brandKit.alone, language))
              .replace("{bundle}", formatPrice(brandKit.withPlan, language))}
            cta={copy.brand.cta}
            message={copy.brand.whatsappMessage}
            location="pricing-brand"
            delay={0.08}
          />
        </div>

        {/* Costos del cliente, fuera del proyecto: dominio, hosting, soporte. */}
        <FadeIn delay={0.1} y={24}>
          <FadeSwap>
            <div className="mt-10 grid gap-5 border-t border-line pt-8 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <h3 className="text-lg font-medium tracking-tight text-ink">{copy.extras.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{copy.extras.intro}</p>
              </div>
              <motion.dl
                className="lg:col-span-8"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={featureList}
              >
                {copy.extras.items.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={featureItem}
                    className="flex flex-col gap-0.5 border-b border-line py-3 first:pt-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                  >
                    <dt className="text-base text-ink">{item.label}</dt>
                    <dd className="text-sm text-ink-muted sm:text-right sm:text-base">{item.value}</dd>
                  </motion.div>
                ))}
              </motion.dl>
            </div>
          </FadeSwap>
        </FadeIn>

        <FadeIn delay={0.1} y={16}>
          <FadeSwap>
            <p className="mt-6 text-sm leading-relaxed text-ink-muted sm:text-base">
              {copy.auditNote.replace("{price}", formatPrice(fullAudit, language))}{" "}
              <a
                href="#audit"
                className="group inline-flex items-center gap-1 font-medium text-accent-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-accent-ink"
              >
                {copy.auditLink}
                <ArrowDown
                  aria-hidden="true"
                  className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
                />
              </a>
              <span className="mt-2 block text-ink-subtle">{copy.currencyNote}</span>
            </p>
          </FadeSwap>
        </FadeIn>
      </div>
    </section>
  );
}

function AddonRow({
  name,
  summary,
  cta,
  message,
  location,
  delay = 0,
}: {
  name: string;
  summary: string;
  cta: string;
  message: string;
  location: string;
  delay?: number;
}) {
  const { language } = useLanguage();

  return (
    <FadeIn delay={0.1 + delay} y={24} className="flex">
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 400, damping: 24 }}
        className="flex w-full flex-col gap-4 rounded-3xl border border-line bg-surface-2 p-6 transition-colors duration-500 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:flex-col lg:items-start lg:justify-between lg:gap-5"
      >
        <FadeSwap>
          <p className="text-lg font-medium tracking-tight text-ink">{name}</p>
          <p className="mt-1 text-base leading-relaxed text-ink-muted">{summary}</p>
        </FadeSwap>
        <a
          href={buildWhatsappUrl(message)}
          onClick={() => trackWhatsappClick(location, language)}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full border border-line-strong px-6 text-sm font-medium text-ink transition-[transform,border-color,color] duration-200 ease-[var(--ease-premium)] hover:border-accent hover:text-accent-ink active:scale-[0.97]"
        >
          {cta}
          <ArrowUpRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </motion.div>
    </FadeIn>
  );
}

/**
 * Celular y tablet: selector de plan con pildora deslizante y una sola
 * tarjeta. Empieza en el plan destacado. La tarjeta entra desde el lado
 * hacia el que se avanza, y se puede arrastrar para cambiar.
 */
function MobilePlans() {
  const { t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const initial = Math.max(0, plans.findIndex((plan) => plan.featured));
  const [[index, direction], setState] = useState<[number, number]>([initial, 0]);
  const plan = plans[index];

  const go = (next: number) => {
    if (next < 0 || next >= plans.length || next === index) return;
    setState([next, next > index ? 1 : -1]);
  };

  return (
    <FadeIn y={24} className="lg:hidden">
      <div
        role="tablist"
        aria-label={t.pricing.title}
        className="relative mx-auto grid max-w-md grid-cols-3 rounded-full border border-line bg-surface-2 p-1 transition-colors duration-500"
      >
        {plans.map((item, i) => {
          const active = i === index;
          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls="plan-panel"
              onClick={() => go(i)}
              className={cn(
                "relative min-h-11 rounded-full px-2 text-sm font-medium transition-colors duration-200",
                active ? "text-white" : "text-ink-muted",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="plan-pill"
                  className="accent-fill absolute inset-0 rounded-full shadow-[0_6px_18px_-8px_rgba(101,42,49,0.8)]"
                  transition={
                    shouldReduceMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }
                  }
                />
              ) : null}
              <span className="relative">
                <FadeSwap>
                  <span>{t.pricing.plans[item.key].short}</span>
                </FadeSwap>
              </span>
            </button>
          );
        })}
      </div>

      {/* Puntos: cuantos planes hay y cual se ve. */}
      <div aria-hidden="true" className="mt-4 flex justify-center gap-1.5">
        {plans.map((item, i) => (
          <motion.span
            key={item.key}
            animate={{ width: i === index ? 20 : 6, opacity: i === index ? 1 : 0.35 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="h-1.5 rounded-full bg-accent-ink"
          />
        ))}
      </div>

      <div id="plan-panel" role="tabpanel" className="relative mt-5 grid">
        {/*
          Planes vecinos asomando por los lados, que es por donde entran
          al cambiar: dicen que hay mas sin ocupar sitio. Detras de la
          tarjeta, mas bajos: solo asoma su canto redondeado, en el margen
          de la pagina.
        */}
        {([-1, 1] as const).map((side) => {
          const neighbour = plans[index + side];
          return (
            <motion.div
              key={side}
              aria-hidden="true"
              initial={false}
              animate={{ opacity: neighbour ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "pointer-events-none absolute inset-y-10 w-12 rounded-2xl border border-line-strong bg-surface-2 shadow-[var(--tech-card-shadow)] transition-colors duration-500",
                side < 0 ? "-left-4" : "-right-4",
              )}
            />
          );
        })}
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={plan.key}
            custom={direction}
            variants={{
              enter: (dir: number) => ({ opacity: 0, x: dir * 60, scale: 0.97 }),
              center: { opacity: 1, x: 0, scale: 1 },
              exit: (dir: number) => ({ opacity: 0, x: dir * -60, scale: 0.97 }),
            }}
            initial={shouldReduceMotion ? false : "enter"}
            animate="center"
            exit={shouldReduceMotion ? undefined : "exit"}
            transition={{ duration: 0.4, ease }}
            drag={shouldReduceMotion ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) go(index + 1);
              else if (info.offset.x > 60) go(index - 1);
            }}
            className="relative z-10 col-start-1 row-start-1 flex touch-pan-y"
          >
            <PlanCard plan={plan} index={index} idPrefix="plan-mobile" animatePrice />
          </motion.div>
        </AnimatePresence>
      </div>
    </FadeIn>
  );
}

/** Precio que cuenta hasta su valor al cambiar de plan. */
function AnimatedPrice({ plan }: { plan: Plan }) {
  const { language } = useLanguage();
  const target = language === "es" ? plan.cop : plan.usd;
  const value = useSpring(target * 0.8, { stiffness: 120, damping: 24 });
  const text = useTransform(value, (v) =>
    formatPrice({ cop: Math.round(v / 10_000) * 10_000, usd: Math.round(v / 10) * 10 }, language),
  );

  useEffect(() => {
    value.set(target);
  }, [value, target]);

  return <motion.span>{text}</motion.span>;
}

function PlanCard({
  plan,
  index,
  idPrefix,
  animatePrice = false,
}: {
  plan: Plan;
  index: number;
  idPrefix: string;
  animatePrice?: boolean;
}) {
  const { t, language } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const copy = t.pricing;
  const item = copy.plans[plan.key as PlanKey];

  return (
    <article
      aria-labelledby={`${idPrefix}-${plan.key}`}
      className={cn(
        "relative flex w-full flex-col overflow-hidden rounded-3xl border p-6 transition-[border-color,box-shadow,background-color] duration-500 sm:p-7",
        plan.featured
          ? "border-accent bg-surface shadow-[var(--tech-card-shadow)]"
          : "border-line-strong bg-surface hover:shadow-[var(--tech-card-shadow)]",
      )}
    >
      {/* Brillo suave del plan destacado, arriba a la derecha. */}
      {plan.featured ? (
        <div
          aria-hidden="true"
          className="glow-accent pointer-events-none absolute -right-20 -top-24 size-64 opacity-50"
        />
      ) : null}

      <FadeSwap className="relative flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 id={`${idPrefix}-${plan.key}`} className="text-lg font-medium tracking-tight text-ink">
            {item.name}
          </h3>
          {plan.featured ? (
            <span className="rounded-full bg-accent-dim px-3 py-1 text-xs font-medium text-accent-ink">
              {copy.featured}
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-base leading-relaxed text-ink-muted">{item.summary}</p>

        <p className="mt-6 flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm text-ink-subtle">{copy.from}</span>
          <span className="text-4xl font-semibold tabular-nums tracking-tighter text-name transition-colors duration-500 sm:text-5xl">
            {animatePrice && !shouldReduceMotion ? (
              <AnimatedPrice plan={plan} />
            ) : (
              formatPrice(plan, language)
            )}
          </span>
          <span className="text-sm font-medium text-ink-subtle">{currency[language]}</span>
        </p>
        <p className="mt-1 text-sm text-ink-subtle">{item.time}</p>

        <motion.ul
          className="mt-6 flex flex-col gap-3 border-t border-line pt-6"
          initial={shouldReduceMotion ? false : "hidden"}
          whileInView="show"
          viewport={{ once: true, amount: 0.4 }}
          variants={featureList}
        >
          {index > 0 ? (
            <motion.li variants={featureItem} className="text-sm font-medium text-ink">
              {copy.includesPrevious}
            </motion.li>
          ) : null}
          {item.features.map((feature) => (
            <motion.li
              key={feature}
              variants={featureItem}
              className="flex gap-3 text-base leading-snug text-ink-muted"
            >
              <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent-ink" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </motion.ul>
      </FadeSwap>

      <a
        href={buildWhatsappUrl(copy.whatsappMessage.replace("{plan}", item.name))}
        onClick={() => trackWhatsappClick(`pricing-${plan.key}`, language)}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group relative mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-[transform,border-color,color] duration-200 ease-[var(--ease-premium)] active:scale-[0.97]",
          plan.featured
            ? "accent-fill hover:scale-[1.02]"
            : "border border-line-strong text-ink hover:border-accent hover:text-accent-ink",
        )}
      >
        {copy.cta}
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    </article>
  );
}
