import dns from "node:dns";
import http from "node:http";
import https from "node:https";
import { isIP } from "node:net";
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

export function isPrivateAddress(address: string): boolean {
  if (isIP(address) === 4) {
    const [a, b, c] = address.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0 && (c === 0 || c === 2)) ||
      (a === 198 && (b === 18 || b === 19)) ||
      (a === 198 && b === 51 && c === 100) ||
      (a === 203 && b === 0 && c === 113) ||
      a >= 224
    );
  }
  const v6 = address.toLowerCase();
  if (v6.startsWith("::ffff:")) {
    const rest = v6.slice(7);
    if (isIP(rest) === 4) return isPrivateAddress(rest);
    // Forma hexadecimal (::ffff:7f00:1): se reconstruye la IPv4.
    const hex = rest.split(":");
    if (hex.length === 2 && hex.every((part) => /^[0-9a-f]{1,4}$/.test(part))) {
      const [hi, lo] = hex.map((part) => parseInt(part, 16));
      return isPrivateAddress(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`);
    }
    return true;
  }
  return (
    v6 === "::" ||
    v6 === "::1" ||
    v6.startsWith("fc") ||
    v6.startsWith("fd") ||
    /^fe[89a-f]/.test(v6) ||
    v6.startsWith("ff") ||
    // NAT64 y 6to4 envuelven una IPv4 cualquiera: no se admiten.
    v6.startsWith("64:ff9b:") ||
    v6.startsWith("2002:")
  );
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
        if (decoder) response.on("error", (error) => decoder.destroy(error));
        resolve({ status: response.statusCode ?? 0, headers: toHeaders(response.headers), body });
      },
    );
    request.on("error", reject);
    request.end();
  });
}
