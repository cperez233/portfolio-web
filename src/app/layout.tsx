import type { Metadata, Viewport } from "next";
import { Fira_Code, Geist } from "next/font/google";
import { LanguageProvider } from "@/lib/language";
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
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // `dark` se sirve desde el servidor: si lo anadiera un efecto en
    // cliente, la primera pintura seria clara y habria destello.
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${firaCode.variable} h-full antialiased`}
    >
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
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
