import type { Metadata, Viewport } from "next";
import { Geist_Mono, Kanit } from "next/font/google";
import { site } from "@/data/site";
import "./globals.css";

/**
 * Kanit es la tipografia del sitio. Se carga con next/font en lugar de
 * <link> a Google: se auto-hospeda, no sale ninguna peticion a
 * google.com y no hay salto de layout al cargar (directriz 6: cero CLS).
 */
const kanit = Kanit({
  variable: "--font-kanit",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

/** Monoespaciada para acentos de codigo. */
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} - ${site.role}`,
    template: `%s - ${site.name}`,
  },
  description:
    "Full-stack software engineer & creator building high-performance architectures, smart automation (n8n/AI), and organic content.",
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${kanit.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-clip bg-canvas font-sans">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-full focus:bg-white focus:px-5 focus:py-3 focus:text-sm focus:text-canvas"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
