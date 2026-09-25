import { dictionaries } from "@/data/content";
import { brandKit, fillPlanPrices, formatPrice, fullAudit, plans, site } from "@/data/site";
import { LANGUAGE_PATHS } from "@/lib/language-detection";
import { siteUrl } from "@/lib/site-url";

/**
 * /llms.txt: resumen en texto plano para asistentes de IA. Sale del mismo
 * diccionario y de los mismos precios que la pagina, asi que nunca dice
 * algo distinto de lo que se ve en ella.
 */
export const dynamic = "force-static";

export function GET() {
  const es = dictionaries.es;
  const en = dictionaries.en;
  const esUrl = new URL(LANGUAGE_PATHS.es, siteUrl).href;
  const enUrl = new URL(LANGUAGE_PATHS.en, siteUrl).href;

  const planLines = (language: "es" | "en") =>
    plans.map((plan) => {
      const item = dictionaries[language].pricing.plans[plan.key];
      const from = dictionaries[language].pricing.from.toLowerCase();
      return `- ${item.name}: ${from} ${formatPrice(plan, language)} (${item.time}). ${item.summary}`;
    });

  const body = [
    `# ${site.name}`,
    "",
    `> ${es.meta.description}`,
    "",
    `${en.meta.description}`,
    "",
    `Sede: ${site.location}. Trabaja en remoto con negocios de toda Colombia y de otros países, en español e inglés.`,
    `Contacto: WhatsApp ${site.phone.replace(/^\+57(\d{3})(\d{3})(\d{4})$/, "+57 $1 $2 $3")} · ${site.email}`,
    "",
    "## Páginas",
    `- [Español](${esUrl}): servicios, casos, precios, revisión gratis y preguntas frecuentes`,
    `- [English](${enUrl}): same content, prices in US dollars`,
    "",
    "## Servicios",
    ...es.services.items.map((item) => `- ${item.name}: ${item.description}`),
    "",
    "## Precios de referencia (COP)",
    ...planLines("es"),
    `- ${es.pricing.custom.name}: ${es.pricing.custom.summary}`,
    `- ${es.pricing.brand.name}: ${es.pricing.brand.summary
      .replace("{price}", formatPrice(brandKit.alone, "es"))
      .replace("{bundle}", formatPrice(brandKit.withPlan, "es"))}`,
    `- Revisión completa de un sitio existente: ${formatPrice(fullAudit, "es")}.`,
    "",
    `### ${es.pricing.extras.title}`,
    es.pricing.extras.intro,
    ...es.pricing.extras.items.map((item) => `- ${item.label}: ${item.value}`),
    "",
    "## Reference prices (USD)",
    ...planLines("en"),
    "",
    "## Preguntas frecuentes",
    ...es.faq.items.flatMap((item) => [
      `### ${item.question}`,
      fillPlanPrices(item.answer, "es"),
      "",
    ]),
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
