import type { Metadata, Viewport } from "next";
import { Fira_Code, Geist } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
import { SmoothScroll } from "@/components/ui/SmoothScroll";
import { FloatingNav } from "@/components/ui/floating-nav";
import { THEME_STORAGE_KEY } from "@/lib/theme-storage";
import { site } from "@/data/site";
import "./globals.css";

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

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.role}`,
    template: `%s - ${site.name}`,
  },
  description:
    "Full-stack software engineering, smart automation, and digital communication that connects.",
};

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `dark` se sirve desde el servidor: si lo anadiera un efecto en
    // cliente, la primera pintura seria clara y habria destello.
    //
    // suppressHydrationWarning porque el script de abajo puede haber
    // cambiado la clase antes de que React hidrate: la discrepancia es
    // intencionada y solo afecta a este nodo.
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${geistSans.variable} ${firaCode.variable} h-full antialiased`}
    >
      <head>
        {/*
          Un <script> suelto y no next/script: `beforeInteractive` encola
          el codigo en `self.__next_s` y lo evalua el runtime de Next, que
          arranca DESPUES de la primera pintura, que es justo el destello
          que esto viene a evitar. Asi se ejecuta al parsear el HTML.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      {/* overflow-x-clip en la raiz, no overflow-hidden: clip no crea un
          contenedor de scroll, asi que el sticky de las secciones sigue
          funcionando. */}
      <body className="flex min-h-full flex-col overflow-x-clip bg-canvas font-sans">
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-canvas"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <LanguageProvider>
          <FloatingNav />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
