import { isIP } from "node:net";
import type { AuditCheckId } from "@/data/content";
import { runChecks } from "@/lib/audit-checks";
import { safeGet } from "@/lib/safe-fetch";

/**
 * Revision gratuita de la seccion #audit: descarga el HTML de la pagina
 * que pega el visitante y comprueba seis puntos basicos. Nada de APIs
 * externas ni claves: todo sale del propio HTML y de la respuesta.
 *
 * Como el servidor abre una URL que escribe cualquiera, se protege contra
 * SSRF: solo http(s) en su puerto por defecto, sin IPs privadas ni de
 * loopback (se comprueba al conectar, ver lib/safe-fetch.ts: asi un DNS
 * que cambia de respuesta no sirve), redirecciones seguidas a mano y
 * revalidadas, tiempo y tamano limitados.
 */

export type AuditResponse =
  | { ok: true; url: string; checks: Record<AuditCheckId, boolean> }
  | { ok: false; error: "invalid" | "unreachable" | "rateLimited" };

const TIMEOUT_MS = 8000;
const MAX_BYTES = 1_500_000;
const MAX_REDIRECTS = 4;

/* Limite por IP, en memoria: basta para frenar a quien pulsa en bucle.
   No es exacto entre instancias, y no hace falta que lo sea. */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

/** "tunegocio.com" -> "https://tunegocio.com/". null si no es una web publica. */
function normalizeUrl(input: unknown): URL | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 300) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password || url.port) return null;
    // Un dominio de verdad tiene punto y no es una IP escrita a mano.
    if (!url.hostname.includes(".") || isIP(url.hostname.replace(/^\[|\]$/g, ""))) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

/** Descarga el HTML siguiendo redirecciones a mano, validando cada salto. */
async function fetchPage(start: URL): Promise<{ url: URL; html: string; headers: Headers } | null> {
  let url = start;
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    // La IP se valida dentro de la conexion (safe-fetch), no antes.
    const response = await safeGet(
      url,
      {
        "user-agent": "Mozilla/5.0 (compatible; CristianPerezSiteCheck/1.0; +https://www.cristianperez.me)",
        accept: "text/html,application/xhtml+xml",
        "accept-encoding": "gzip, deflate, br",
      },
      signal,
    );

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      response.body.destroy();
      const next = location ? normalizeUrl(new URL(location, url).href) : null;
      if (!next) return null;
      url = next;
      continue;
    }

    if (response.status < 200 || response.status >= 300) {
      response.body.destroy();
      return null;
    }

    // Lectura con tope: una pagina enorme no llena la memoria.
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of response.body) {
      chunks.push(chunk as Buffer);
      size += (chunk as Buffer).byteLength;
      if (size >= MAX_BYTES) break;
    }
    response.body.destroy();

    const html = new TextDecoder().decode(Buffer.concat(chunks));
    return { url, html, headers: response.headers };
  }
  return null;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return Response.json({ ok: false, error: "rateLimited" } satisfies AuditResponse, { status: 429 });
  }

  // Un cuerpo legitimo es {"url": "..."}: cualquier cosa grande se descarta.
  if (Number(request.headers.get("content-length") ?? 0) > 2000) {
    return Response.json({ ok: false, error: "invalid" } satisfies AuditResponse, { status: 413 });
  }
  const body = await request.json().catch(() => null);
  const url = normalizeUrl(body?.url);
  if (!url) {
    return Response.json({ ok: false, error: "invalid" } satisfies AuditResponse, { status: 400 });
  }

  try {
    // Un fallo de red o de certificado cuenta como "no responde".
    const attempt = (target: URL) => fetchPage(target).catch(() => null);
    let page = await attempt(url);
    // Si la version https no responde, algunas paginas viejas solo tienen http.
    if (!page && url.protocol === "https:" && !/^https:/i.test(String(body.url).trim())) {
      page = await attempt(new URL(url.href.replace(/^https:/, "http:")));
    }
    if (!page) {
      return Response.json({ ok: false, error: "unreachable" } satisfies AuditResponse, { status: 422 });
    }
    return Response.json({
      ok: true,
      url: page.url.hostname.replace(/^www\./, ""),
      checks: runChecks(page),
    } satisfies AuditResponse);
  } catch {
    return Response.json({ ok: false, error: "unreachable" } satisfies AuditResponse, { status: 422 });
  }
}
