import { NextResponse, type NextRequest } from "next/server";
import {
  LANGUAGE_COOKIE,
  LANGUAGE_PATHS,
  detectLanguage,
  isLanguage,
} from "@/lib/language-detection";

/**
 * Idioma de entrada (Next 16: `proxy.ts`, antes `middleware.ts`).
 *
 * Solo actua sobre "/", que es la version en ingles y a la vez el
 * x-default de hreflang: la puerta de entrada que reparte por idioma.
 * Si el usuario eligio espanol con el toggle, o no eligio y las cabeceras
 * piden espanol (Accept-Language, o el pais que anade Vercel en
 * x-vercel-ip-country), se le manda a "/es".
 *
 * "/es" no pasa por aqui: un enlace a la version en espanol siempre la
 * sirve tal cual. Googlebot rastrea sin Accept-Language y desde EE. UU.,
 * asi que ve "/" en ingles y llega a "/es" por hreflang y el sitemap.
 */
export function proxy(request: NextRequest) {
  const manual = request.cookies.get(LANGUAGE_COOKIE)?.value;

  const language = isLanguage(manual)
    ? manual
    : detectLanguage({
        acceptLanguage: request.headers.get("accept-language"),
        country: request.headers.get("x-vercel-ip-country"),
      });

  if (language === "en") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = LANGUAGE_PATHS.es;
  // 307: temporal a proposito. Depende de quien visita, y un 308 lo
  // cachearia el navegador para siempre.
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/"],
};
