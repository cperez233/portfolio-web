import type { MetadataRoute } from "next";
import { LANGUAGE_PATHS } from "@/lib/language-detection";
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
  const lastModified = new Date("2026-09-24");

  return [
    { url: en, lastModified, alternates },
    { url: es, lastModified, alternates },
  ];
}
