import { NextResponse, type NextRequest } from "next/server";
import {
  DETECTED_LANGUAGE_COOKIE,
  LANGUAGE_COOKIE,
  detectLanguage,
} from "@/lib/language-detection";

/**
 * Idioma de entrada (Next 16: `proxy.ts`, antes `middleware.ts`).
 *
 * La pagina es estatica y cambia de idioma en el cliente, asi que aqui no
 * se redirige ni se reescribe nada: solo se deja en una cookie el idioma
 * que piden las cabeceras (Accept-Language y el pais que anade Vercel en
 * x-vercel-ip-country). El store de idioma la lee al hidratar. El pais
 * solo existe en el servidor, de ahi que haga falta este paso.
 *
 * Si el usuario ya eligio idioma con el toggle, esa cookie manda y no se
 * detecta nada.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(LANGUAGE_COOKIE)) return NextResponse.next();

  const detected = detectLanguage({
    acceptLanguage: request.headers.get("accept-language"),
    country: request.headers.get("x-vercel-ip-country"),
  });

  const response = NextResponse.next();
  if (request.cookies.get(DETECTED_LANGUAGE_COOKIE)?.value !== detected) {
    response.cookies.set(DETECTED_LANGUAGE_COOKIE, detected, {
      path: "/",
      sameSite: "lax",
      // Se renueva en cada visita sin eleccion manual; un mes basta.
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

/*
  Solo paginas: fuera los estaticos de Next, la optimizacion de imagenes
  y cualquier ruta con extension (imagenes de /public, el CV en PDF, la
  imagen Open Graph).
*/
export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.[^/]+$).*)"],
};
