import type { Metadata, Viewport } from "next";
import { Antic, Fira_Code, Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/data/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Fuentes del hero. Se cargan con next/font en lugar de <link> a Google:
 * se auto-hospedan, no salen peticiones a google.com y no hay salto de
 * layout al cargar (directriz 6: nada de CLS).
 */
const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const antic = Antic({
  variable: "--font-antic",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.role}`,
    template: `%s - ${site.name}`,
  },
  description:
    "Diseno y desarrollo web para negocios que ya tienen demanda y necesitan una web que sostenga su precio.",
};

export const viewport: Viewport = {
  // Tine la barra del navegador movil del color de la marca (directriz 6).
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${firaCode.variable} ${antic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:text-canvas"
        >
          Saltar al contenido
        </a>
        {/*
          El <Navbar /> del sitio sale de aqui: PortfolioHero trae su propio
          header fijo con menu y toggle. Dos navegaciones se solapaban.
          Para recuperarlo, reimportar Navbar y montarlo sobre {children}.
        */}
        {children}
        <Footer />
      </body>
    </html>
  );
}
