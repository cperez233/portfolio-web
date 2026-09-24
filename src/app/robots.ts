import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

/**
 * Todo rastreable, incluidos los buscadores de IA (OAI-SearchBot,
 * Claude-SearchBot, PerplexityBot): el sitio es un portafolio y lo que
 * interesa es justo que lo encuentren y lo citen.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
