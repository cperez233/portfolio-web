import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import type { AuditCheckId } from "@/data/content";
import { runChecks } from "@/lib/audit-checks";

/**
 * Revision gratuita de la seccion #audit: descarga el HTML de la pagina
 * que pega el visitante y comprueba seis puntos basicos. Nada de APIs
 * externas ni claves: todo sale del propio HTML y de la respuesta.
 *
 * Como el servidor abre una URL que escribe cualquiera, se protege contra
 * SSRF: solo http(s) en su puerto por defecto, sin IPs privadas ni de
 * loopback (tampoco tras resolver el DNS), redirecciones seguidas a mano
 * y revalidadas, tiempo y tamano limitados.
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

function isPrivateAddress(address: string) {
  if (isIP(address) === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = address.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    v6.startsWith("fe80") ||
    v6.startsWith("ff")
  );
}

async function resolvesToPublic(hostname: string) {
  try {
    const addresses = await lookup(hostname, { all: true });
    return addresses.length > 0 && addresses.every(({ address }) => !isPrivateAddress(address));
  } catch {
    return false;
  }
}

/** Descarga el HTML siguiendo redirecciones a mano, validando cada salto. */
async function fetchPage(start: URL): Promise<{ url: URL; html: string; headers: Headers } | null> {
  let url = start;
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!(await resolvesToPublic(url.hostname))) return null;

    const response = await fetch(url, {
      redirect: "manual",
      signal,
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; CristianPerezSiteCheck/1.0; +https://www.cristianperez.me)",
        accept: "text/html,application/xhtml+xml",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      const next = location ? normalizeUrl(new URL(location, url).href) : null;
      if (!next) return null;
      url = next;
      continue;
    }

    if (!response.ok || !response.body) return null;

    // Lectura con tope: una pagina enorme no llena la memoria.
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (size < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      size += value.byteLength;
    }
    await reader.cancel().catch(() => {});

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
