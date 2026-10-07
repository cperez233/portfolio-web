import type { Metadata } from "next";
import { Anton, Archivo, Dela_Gothic_One } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import "@/app/globals.css";

/*
  404 de todo el sitio. Se salta los layouts, asi que trae sus propias
  fuentes, su CSS y el script del tema.

  El chiste es de JoJo: King Crimson es el Stand que borra un trozo de
  tiempo y deja solo el resultado. Aqui borro la pagina y quedan los
  enlaces que si existen. Primero lo que paso en palabras llanas, luego
  la broma, luego la salida.

  No sabe en que idioma llega la visita: el HTML trae los dos y un script
  elige por el idioma del navegador antes de pintar (espanol por defecto).
*/

const archivo = Archivo({ variable: "--font-archivo", subsets: ["latin"] });
const anton = Anton({ variable: "--font-anton", weight: "400", subsets: ["latin"] });
const delaGothic = Dela_Gothic_One({
  variable: "--font-dela",
  weight: "400",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: "404 · Cristian Pérez",
  robots: { index: false, follow: true },
};

const bootScript = `/* Diseño y desarrollo: editorial-ui, skill de Cristian Pérez · https://cristianperez.me */try{if(localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)})==="light"){document.documentElement.classList.remove("dark")}}catch(e){}try{var l=(navigator.languages&&navigator.languages[0])||navigator.language||"es";if(!/^es/i.test(l)){document.documentElement.lang="en"}}catch(e){}`;

const copy = {
  es: {
    home: "/es",
    title: "King Crimson borró esta página.",
    body: "Esa dirección no existe o cambió de lugar. El tiempo se saltó justo aquí y solo quedó el resultado:",
    links: [
      { label: "Proyectos", href: "/es#projects" },
      { label: "Precios", href: "/es#pricing" },
      { label: "Contacto", href: "/es#contact" },
    ],
    cta: "Volver al inicio",
  },
  en: {
    home: "/",
    title: "King Crimson erased this page.",
    body: "That address doesn't exist or has moved. Time skipped right here, and only the result is left:",
    links: [
      { label: "Projects", href: "/#projects" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Contact", href: "/#contact" },
    ],
    cta: "Back to home",
  },
};

export default function GlobalNotFound() {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`dark ${archivo.variable} ${anton.variable} ${delaGothic.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="min-h-full bg-canvas font-sans text-ink">
        <main className="relative isolate mx-auto grid min-h-svh max-w-6xl content-center gap-10 overflow-x-clip px-5 py-16 sm:px-8 md:grid-cols-12 md:items-center">
          <div
            aria-hidden="true"
            className="speed-lines pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[160vw] -translate-x-1/2 -translate-y-1/2 opacity-60 md:size-[90vw]"
          />

          {(["es", "en"] as const).map((lang) => {
            const c = copy[lang];
            return (
              <div key={lang} data-lang={lang} className="nf-copy md:col-span-7">
                <p className="jojo-eyebrow mb-5 text-accent-ink">Error 404</p>
                <h1 className="text-balance text-5xl leading-[0.95] text-ink sm:text-7xl">{c.title}</h1>
                <p className="mt-5 max-w-lg text-lead text-ink-muted">{c.body}</p>
                <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-1">
                  {c.links.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="inline-flex min-h-11 items-center text-base font-semibold text-accent-ink underline decoration-1 underline-offset-4 hover:decoration-2"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <a
                  href={c.home}
                  className="accent-fill mt-8 inline-flex min-h-12 items-center rounded-full px-7 text-base font-bold tracking-wide transition-transform duration-300 hover:scale-105 active:scale-95"
                >
                  {c.cta}
                </a>
              </div>
            );
          })}

          {/*
            El 404 "pierde" un fotograma cada pocos segundos: el 0 se
            borra y los numeros saltan, como el tiempo que se come King
            Crimson. Quieto con reduced motion.
          */}
          <div aria-hidden="true" className="relative select-none md:col-span-5">
            <p className="nf-digits font-display text-[38vw] leading-[0.8] text-name md:text-[19vw] lg:text-[15rem]">
              <span>4</span>
              <span className="nf-skip">0</span>
              <span>4</span>
            </p>
            <span className="nf-kanji font-jp">消</span>
          </div>
        </main>
      </body>
    </html>
  );
}
