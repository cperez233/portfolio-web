import type { Metadata, Viewport } from "next";
import { Fira_Code, Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { dictionaries, type Language } from "@/data/content";
import { LanguageProvider } from "@/lib/language";
import { LANGUAGE_PATHS } from "@/lib/language-detection";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { FloatingNav } from "@/components/ui/floating-nav";
import { JsonLd } from "@/components/json-ld";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { site } from "@/data/site";
import { siteUrl } from "@/lib/site-url";
import "@/app/globals.css";

/**
 * Dos familias y no mas: grotesca sobria para lectura, mono para tags,
 * numeros y el nombre monumental del hero.
 *
 * Se cargan con next/font en lugar de <link> a Google: se auto-hospedan,
 * no sale ninguna peticion a google.com y no hay salto de layout.
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

/*
  Title y description viven en content.ts (`meta`), uno por idioma: dicen
  que se contrata y donde, no solo el cargo, porque es lo que se lee en
  el resultado de Google.

  metadataBase convierte /og-image.png en una URL absoluta, que es lo que
  exigen WhatsApp, LinkedIn y Discord para la vista previa. Ver
  lib/site-url.ts.
*/

/** Generada por app/og-image.png/route.tsx. */
const ogImage = { url: "/og-image.png", width: 1200, height: 630 };

/**
 * hreflang: cada version enlaza a las dos, incluida ella misma. "/" es
 * tambien x-default porque es la puerta que reparte por idioma (proxy.ts).
 */
const languageAlternates = {
  en: LANGUAGE_PATHS.en,
  "es-CO": LANGUAGE_PATHS.es,
  "x-default": LANGUAGE_PATHS.en,
};

export function buildMetadata(language: Language): Metadata {
  const { title, description, ogLocale } = dictionaries[language].meta;
  const other: Language = language === "en" ? "es" : "en";

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s | ${site.name}` },
    description,
    alternates: {
      canonical: LANGUAGE_PATHS[language],
      languages: languageAlternates,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { "max-image-preview": "large", "max-snippet": -1 },
    },
    openGraph: {
      type: "website",
      url: LANGUAGE_PATHS[language],
      siteName: site.name,
      title,
      description,
      locale: ogLocale,
      alternateLocale: [dictionaries[other].meta.ogLocale],
      images: [{ ...ogImage, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage.url],
    },
  };
}

export const viewport: Viewport = {
  /*
    Un themeColor por esquema. Antes habia uno solo y fijo en negro, asi
    que en tema claro la barra del navegador seguia pintandose oscura.
  */
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  // El sitio tiene los dos temas: declarar solo `dark` hacia que los
  // controles nativos y la barra de scroll se quedasen oscuros en claro.
  colorScheme: "dark light",
};

/*
  Se ejecuta antes de la primera pintura, de ahi que sea un script en
  linea y no un efecto: leer la preferencia despues de montar significa
  pintar oscuro y saltar a claro a la vista del usuario.

  El servidor ya escribe `class="dark"`, asi que aqui solo hay que
  quitarla cuando la preferencia guardada es el tema claro.
*/
const themeScript = `try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light"){document.documentElement.classList.remove("dark")}}catch(e){}`;

/** Texto del enlace de salto, que va fuera del LanguageProvider. */
const skipLabel: Record<Language, string> = {
  en: "Skip to content",
  es: "Saltar al contenido",
};

/**
 * <html> y <body> comunes a las dos versiones. Hay dos layouts raiz,
 * app/(en)/layout.tsx y app/(es)/es/layout.tsx, porque `lang` tiene que
 * salir del servidor ya correcto en cada URL y un layout raiz no conoce
 * la ruta. Los dos solo llaman a este componente.
 */
export function RootShell({
  language,
  children,
}: {
  language: Language;
  children: React.ReactNode;
}) {
  return (
    // `dark` se sirve desde el servidor: si lo anadiera un efecto en
    // cliente, la primera pintura seria clara y habria destello.
    //
    // suppressHydrationWarning porque el script de abajo puede haber
    // cambiado la clase antes de que React hidrate: la discrepancia es
    // intencionada y solo afecta a este nodo.
    <html
      lang={language}
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      {/* La regla asume que <head> solo aparece en app/layout.tsx; este
          componente ES el layout raiz, compartido por los dos idiomas. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/*
          Un <script> suelto y no next/script: `beforeInteractive` encola
          el codigo en `self.__next_s` y lo evalua el runtime de Next, que
          arranca DESPUES de la primera pintura, que es justo el destello
          que esto viene a evitar. Asi se ejecuta al parsear el HTML.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <JsonLd language={language} />
      </head>
      {/* overflow-x-clip en la raiz, no overflow-hidden: clip no crea un
          contenedor de scroll, asi que el sticky de las secciones sigue
          funcionando. */}
      <body className="flex min-h-full flex-col overflow-x-clip bg-canvas font-sans">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-canvas"
        >
          {skipLabel[language]}
        </a>
        <SmoothScroll />
        <LanguageProvider initialLanguage={language}>
          <FloatingNav />
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
