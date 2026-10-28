import type { Metadata } from "next";
import { Anton, Archivo } from "next/font/google";
import { dictionaries, type Language } from "@/data/content";
import { site } from "@/data/site";
import { LANGUAGE_PATHS, PRIVACY_PATHS } from "@/lib/language-detection";
import { siteUrl } from "@/lib/site-url";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import "@/app/globals.css";

/*
  Politica de privacidad: una pagina estatica por idioma, sin el resto del
  sitio (nada de navegacion flotante, escenas ni analitica). Como el 404,
  tiene su propio <html>: por eso vive en un grupo de rutas con layout raiz
  propio y trae sus fuentes y el script del tema.
*/
const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });

const themeScript = `try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light"){document.documentElement.classList.remove("dark")}}catch(e){}`;

export function buildPrivacyMetadata(language: Language): Metadata {
  const { title, description } = dictionaries[language].privacy;
  return {
    metadataBase: new URL(siteUrl),
    title: `${title} | ${site.name}`,
    description,
    alternates: {
      canonical: PRIVACY_PATHS[language],
      languages: { en: PRIVACY_PATHS.en, "es-CO": PRIVACY_PATHS.es, "x-default": PRIVACY_PATHS.en },
    },
    robots: { index: true, follow: true },
  };
}

/** Layout raiz de cada politica: <html>, fuentes y tema. */
export function LegalRoot({ language, children }: { language: Language; children: React.ReactNode }) {
  return (
    <html
      lang={language}
      suppressHydrationWarning
      className={`dark ${archivo.variable} ${anton.variable} h-full antialiased`}
    >
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full bg-canvas font-sans text-ink">{children}</body>
    </html>
  );
}

export function LegalContent({ language }: { language: Language }) {
  const { privacy } = dictionaries[language];
  const other: Language = language === "en" ? "es" : "en";
  const withEmail = (text: string) =>
    text.split("{email}").flatMap((part, i, all) =>
      i < all.length - 1
        ? [
            part,
            <a key={i} href={`mailto:${site.email}`} className="text-accent-ink underline underline-offset-4">
              {site.email}
            </a>,
          ]
        : [part],
    );

  return (
        <main id="content" className="mx-auto max-w-2xl px-5 py-16 sm:px-8">
          <nav className="flex items-center justify-between gap-4 text-base font-semibold">
            <a
              href={LANGUAGE_PATHS[language]}
              className="inline-flex min-h-11 items-center text-accent-ink underline underline-offset-4"
            >
              {privacy.back}
            </a>
            <a
              href={PRIVACY_PATHS[other]}
              hrefLang={other}
              lang={other}
              className="inline-flex min-h-11 items-center text-ink-muted underline underline-offset-4 hover:text-ink"
            >
              {privacy.switchLabel}
            </a>
          </nav>
          <h1 className="mt-8 text-balance text-5xl leading-[0.95] text-ink sm:text-6xl">{privacy.title}</h1>
          <p className="mt-4 text-sm text-ink-subtle">{privacy.updated}</p>
          {privacy.sections.map((section) => (
            <section key={section.title} className="mt-10">
              <h2 className="text-2xl font-semibold tracking-tight text-ink">{section.title}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-lead text-ink-muted">
                  {withEmail(paragraph)}
                </p>
              ))}
            </section>
          ))}
        </main>
  );
}
