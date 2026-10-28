import type { MetadataRoute } from "next";
import { LANGUAGE_PATHS, PRIVACY_PATHS } from "@/lib/language-detection";
import { siteUrl } from "@/lib/site-url";

/**
 * Las dos versiones del sitio, cada una con sus alternativas de idioma
 * (el mismo hreflang que va en el <head>).
 *
 * lastModified es fijo a proposito: tiene que ser la fecha en que cambio
 * el contenido, no la del build. Actualizala al tocar el texto del sitio.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const en = new URL(LANGUAGE_PATHS.en, siteUrl).href;
  const es = new URL(LANGUAGE_PATHS.es, siteUrl).href;
  const alternates = { languages: { en, "es-CO": es, "x-default": en } };
  const lastModified = new Date("2026-09-30");

  const privacyEn = new URL(PRIVACY_PATHS.en, siteUrl).href;
  const privacyEs = new URL(PRIVACY_PATHS.es, siteUrl).href;
  const privacyAlternates = { languages: { en: privacyEn, "es-CO": privacyEs, "x-default": privacyEn } };
  const policyModified = new Date("2026-10-28");

  return [
    { url: en, lastModified, alternates },
    { url: es, lastModified, alternates },
    { url: privacyEn, lastModified: policyModified, alternates: privacyAlternates },
    { url: privacyEs, lastModified: policyModified, alternates: privacyAlternates },
  ];
}
