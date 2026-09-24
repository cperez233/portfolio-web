import { dictionaries, type Language } from "@/data/content";
import { footerGroups, portrait, site } from "@/data/site";
import { LANGUAGE_PATHS } from "@/lib/language-detection";
import { siteUrl } from "@/lib/site-url";

/**
 * Datos estructurados de la pagina: la persona, el sitio y la pagina de
 * perfil que los une. Componente de servidor, asi que el JSON-LD va en el
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
        jobTitle: site.role,
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
        dateModified: "2026-09-24",
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
