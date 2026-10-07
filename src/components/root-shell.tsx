import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Dela_Gothic_One, Fira_Code } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { dictionaries, type Language } from "@/data/content";
import { LanguageProvider } from "@/lib/language";
import { LANGUAGE_PATHS } from "@/lib/language-detection";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { PauseOffscreenLoops } from "@/components/ui/pause-offscreen-loops";
import { FloatingNav } from "@/components/ui/floating-nav";
import { EasterEggs } from "@/components/easter-eggs";
import { SectionCurtain } from "@/components/ui/section-curtain";
import { MiniStand } from "@/components/mini-stand/mini-stand";
import { SecretToast } from "@/components/secrets";
import { JsonLd } from "@/components/json-ld";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { site } from "@/data/site";
import { siteUrl } from "@/lib/site-url";
import "@/app/globals.css";

/**
 * Tipografia estilo JoJo, la misma del README de perfil: Archivo para
 * lectura, Anton para titulos, Dela Gothic para el ゴゴゴ decorativo y
 * mono para tags y numeros.
 *
 * Se cargan con next/font en lugar de <link> a Google: se auto-hospedan,
 * no sale ninguna peticion a google.com y no hay salto de layout.
 */
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

/* Estilo JoJo: Anton para titulos y nombres, como la portada del README. */
const anton = Anton({
  variable: "--font-anton",
  weight: "400",
  subsets: ["latin"],
});

/*
  Katakana y SFX manga (ゴゴゴ, ドドド). preload false: la fuente solo trae
  el subconjunto latino como "subset" y los glifos japoneses llegan por
  unicode-range cuando se usan.
*/
const delaGothic = Dela_Gothic_One({
  variable: "--font-dela",
  weight: "400",
  subsets: ["latin"],
  preload: false,
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
    { media: "(prefers-color-scheme: light)", color: "#f1ebdf" },
    { media: "(prefers-color-scheme: dark)", color: "#111013" },
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
const themeScript = `/* Diseño y desarrollo: editorial-ui, skill de Cristian Pérez · https://cristianperez.me */try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light"){document.documentElement.classList.remove("dark")}}catch(e){}`;

/*
  Red de seguridad de las animaciones. Muchas secciones salen del
  servidor en opacidad 0 y las hace aparecer Framer Motion al hidratar.
  Si el JavaScript no llega a arrancar (un navegador viejo, un error),
  la pagina se quedaba en blanco bajo el hero. Si a los 6 s React no ha
  marcado `__hydrated` (lo hace SmoothScroll), la clase motion-fallback
  fuerza todo visible (ver globals.css).
*/
const motionFallbackScript = `setTimeout(function(){if(!window.__hydrated){document.documentElement.classList.add("motion-fallback")}},6000)`;

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
      className={`dark ${archivo.variable} ${anton.variable} ${delaGothic.variable} ${firaCode.variable} h-full antialiased`}
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
        <script dangerouslySetInnerHTML={{ __html: motionFallbackScript }} />
        {/* Sin JavaScript, lo mismo desde el principio. */}
        <noscript>
          <style>{`[style*="opacity"]{opacity:1!important}[style*="transform"]{transform:none!important}`}</style>
        </noscript>
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
        <PauseOffscreenLoops />
        <LanguageProvider initialLanguage={language}>
          <FloatingNav />
          {children}
          <EasterEggs />
          <SectionCurtain />
          <MiniStand />
          <SecretToast />
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
