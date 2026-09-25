import type { AuditCheckId } from "@/data/content";

/**
 * Las seis comprobaciones de la revision gratuita, sobre el HTML ya
 * descargado. Separadas de la ruta para poder probarlas con HTML fijo.
 */

/** Contenido de un <meta> por name o property, sin importar el orden de atributos. */
function metaContent(html: string, key: string) {
  const tags = html.match(/<meta\b[^>]*>/gi) ?? [];
  for (const tag of tags) {
    const name = tag.match(/\b(?:name|property)\s*=\s*["']([^"']+)["']/i)?.[1];
    if (name?.toLowerCase() === key) {
      return tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() ?? "";
    }
  }
  return null;
}

export function runChecks(page: { url: URL; html: string; headers: Headers }): Record<AuditCheckId, boolean> {
  const { url, html, headers } = page;
  const head = html.slice(0, 400_000);
  const title = head.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? "";
  const description = metaContent(head, "description") ?? "";
  const robots = `${metaContent(head, "robots") ?? ""} ${headers.get("x-robots-tag") ?? ""}`;

  return {
    https: url.protocol === "https:",
    mobile: /width\s*=\s*device-width/i.test(metaContent(head, "viewport") ?? ""),
    meta: title.length > 0 && description.length >= 50,
    schema: /<script[^>]+type\s*=\s*["']application\/ld\+json["']/i.test(html),
    preview: Boolean(metaContent(head, "og:image")),
    indexable: !/noindex/i.test(robots),
  };
}
