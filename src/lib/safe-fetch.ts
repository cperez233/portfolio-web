import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP } from "node:net";
import { createBrotliDecompress, createGunzip, createInflate } from "node:zlib";
import type { Readable } from "node:stream";

/**
 * Descarga de una pagina que escribe un visitante, a prueba de SSRF.
 *
 * Antes se resolvia el DNS para comprobar la IP y despues `fetch` volvia a
 * resolverlo: un dominio con TTL 0 podia contestar una IP publica a la
 * primera y 127.0.0.1 a la segunda (DNS rebinding). Aqui la comprobacion
 * va dentro del `lookup` de la propia conexion, asi que la IP validada es
 * la IP a la que se conecta. Las redirecciones se siguen a mano y cada
 * salto pasa otra vez por aqui.
 */

export class BlockedAddressError extends Error {}

/**
 * Rangos que nunca se deben alcanzar desde el servidor. IPv4 por lista de
 * rangos prohibidos; IPv6 al reves: solo se admite el unicast global
 * (2000::/3) menos los rangos reservados que caen dentro. Cualquier forma
 * rara (compatible con IPv4, mapeada, NAT64, local) queda fuera por defecto.
 */
const denied = new BlockList();
for (const [net, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 3],
] as const) {
  denied.addSubnet(net, prefix, "ipv4");
}
for (const [net, prefix] of [
  ["2001::", 23], // protocolos IETF: Teredo, ORCHID, etc.
  ["2001:db8::", 32], // documentacion
  ["2002::", 16], // 6to4
  ["3fff::", 20], // documentacion
] as const) {
  denied.addSubnet(net, prefix, "ipv6");
}
const globalUnicast = new BlockList();
globalUnicast.addSubnet("2000::", 3, "ipv6");

export function isPrivateAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) return denied.check(address, "ipv4");
  if (family === 6) return !globalUnicast.check(address, "ipv6") || denied.check(address, "ipv6");
  return true;
}

type LookupCallback = (
  error: NodeJS.ErrnoException | null,
  address: string | dns.LookupAddress[],
  family?: number,
) => void;

/** `lookup` de la conexion: resuelve y rechaza si algun destino es privado. */
export function safeLookup(
  hostname: string,
  options: dns.LookupOptions,
  callback: LookupCallback,
) {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error, "");
    const list = addresses as dns.LookupAddress[];
    if (list.length === 0 || list.some(({ address }) => isPrivateAddress(address))) {
      return callback(new BlockedAddressError("blocked address"), "");
    }
    if (options.all) return callback(null, list);
    callback(null, list[0].address, list[0].family);
  });
}

export interface SafeResponse {
  status: number;
  headers: Headers;
  body: Readable;
}

function toHeaders(raw: http.IncomingHttpHeaders) {
  const headers = new Headers();
  for (const [name, value] of Object.entries(raw)) {
    if (value === undefined) continue;
    for (const item of Array.isArray(value) ? value : [value]) headers.append(name, item);
  }
  return headers;
}

/** Una peticion GET sin seguir redirecciones. */
export function safeGet(url: URL, headers: Record<string, string>, signal: AbortSignal) {
  return new Promise<SafeResponse>((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.request(
      url,
      { method: "GET", headers, signal, lookup: safeLookup as never, agent: false },
      (response) => {
        const encoding = String(response.headers["content-encoding"] ?? "").toLowerCase();
        const decoder =
          encoding === "gzip" ? createGunzip() : encoding === "br" ? createBrotliDecompress() : encoding === "deflate" ? createInflate() : null;
        const body = decoder ? response.pipe(decoder) : response;
        if (decoder) {
          response.on("error", (error) => decoder.destroy(error));
          // Destruir el descompresor tambien debe cerrar la conexion.
          decoder.on("close", () => response.destroy());
        }
        resolve({ status: response.statusCode ?? 0, headers: toHeaders(response.headers), body });
      },
    );
    request.on("error", reject);
    request.end();
  });
}
