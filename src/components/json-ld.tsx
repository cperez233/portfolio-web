import { dictionaries, type Language } from "@/data/content";
import { brandKit, currency, fillPlanPrices, formatPrice, footerGroups, plans, portrait, site } from "@/data/site";
import { LANGUAGE_PATHS } from "@/lib/language-detection";
import { siteUrl } from "@/lib/site-url";

/**
 * Datos estructurados de la pagina: la persona, el servicio que ofrece
 * (con los planes y sus precios), el sitio, la pagina de perfil que los
 * une y las preguntas frecuentes. Componente de servidor, asi que el JSON-LD va en el
 * HTML inicial y lo leen tambien los rastreadores que no ejecutan JS.
 *
 * Todo sale de site.ts y content.ts: si cambia un perfil o un servicio,
 * los datos estructurados cambian con el. Solo datos visibles en la
 * pagina, nada inventado.
 */
export function JsonLd({ language }: { language: Language }) {
  // La persona y el sitio son los mismos en las dos versiones, asi que
  // sus @id no cambian; la ProfilePage es la de la URL de este idioma.
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const pageUrl = new URL(LANGUAGE_PATHS[language], siteUrl).href;
  // Precios y moneda cambian por idioma, asi que el servicio es uno por URL.
  const serviceId = `${pageUrl}#service`;
  const t = dictionaries[language];

  const sameAs = footerGroups
    .flatMap((group) => group.links)
    .filter((link) => link.external && !link.href.startsWith("https://wa.me"))
    .map((link) => link.href);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: site.name,
        url: `${siteUrl}/`,
        image: `${siteUrl}${portrait.local}`,
        jobTitle: t.meta.jobTitle,
        description: t.meta.description,
        email: site.email,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bucaramanga",
          addressRegion: "Santander",
          addressCountry: "CO",
        },
        knowsLanguage: ["es", "en"],
        knowsAbout: t.services.items.map((item) => item.name),
        sameAs,
      },
      /*
        El negocio: Bucaramanga como sede y zona principal, pero tambien
        el resto de Colombia y clientes de fuera, en remoto.
      */
      {
        "@type": "ProfessionalService",
        "@id": serviceId,
        name: `${site.name} · ${t.meta.jobTitle}`,
        url: pageUrl,
        image: `${siteUrl}${portrait.local}`,
        description: t.meta.description,
        founder: { "@id": personId },
        email: site.email,
        telephone: site.phone,
        priceRange: fillPlanPrices("{landing} – {panel}+", language),
        currenciesAccepted: "COP, USD",
        availableLanguage: ["es", "en"],
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bucaramanga",
          addressRegion: "Santander",
          addressCountry: "CO",
        },
        areaServed: [
          { "@type": "City", name: "Bucaramanga" },
          { "@type": "AdministrativeArea", name: "Área Metropolitana de Bucaramanga" },
          { "@type": "Country", name: "Colombia" },
          { "@type": "Place", name: language === "es" ? "Todo el mundo (remoto)" : "Worldwide (remote)" },
        ],
        sameAs,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: t.pricing.title,
          itemListElement: plans.map((plan) => {
            const item = t.pricing.plans[plan.key];
            return {
              "@type": "Offer",
              name: item.name,
              description: item.summary,
              url: `${pageUrl}#pricing`,
              priceSpecification: {
                "@type": "PriceSpecification",
                minPrice: currency[language] === "COP" ? plan.cop : plan.usd,
                priceCurrency: currency[language],
              },
              itemOffered: { "@type": "Service", name: item.name, description: item.features.join(". ") },
            };
          }).concat({
            "@type": "Offer",
            name: t.pricing.brand.name,
            description: t.pricing.brand.summary
              .replace("{price}", formatPrice(brandKit.alone, language))
              .replace("{bundle}", formatPrice(brandKit.withPlan, language)),
            url: `${pageUrl}#pricing`,
            priceSpecification: {
              "@type": "PriceSpecification",
              minPrice: currency[language] === "COP" ? brandKit.withPlan.cop : brandKit.withPlan.usd,
              priceCurrency: currency[language],
            },
            itemOffered: { "@type": "Service", name: t.pricing.brand.name, description: t.pricing.brand.summary.split(".")[0] },
          }),
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: `${siteUrl}/`,
        name: site.name,
        inLanguage: ["en", "es"],
        publisher: { "@id": personId },
      },
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profile`,
        url: pageUrl,
        name: t.meta.title,
        inLanguage: language,
        isPartOf: { "@id": websiteId },
        mainEntity: { "@id": personId },
        about: { "@id": serviceId },
        // Fecha y hora completas con zona horaria (ISO 8601). Solo la
        // fecha ("2026-09-25") Search Console la marca como no valida.
        dateModified: "2026-09-25T00:00:00-05:00",
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        url: `${pageUrl}#faq`,
        inLanguage: language,
        isPartOf: { "@id": websiteId },
        mainEntity: t.faq.items.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: fillPlanPrices(item.answer, language) },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
