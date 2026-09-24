/**
 * URL absoluta del sitio. La comparten metadataBase, robots.txt, el
 * sitemap y el JSON-LD: todos tienen que apuntar al mismo host canonico.
 *
 * En Vercel sale del dominio de produccion del proyecto (variable que
 * Vercel inyecta en el build); en local, de localhost. Sin barra final.
 */
export const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";
