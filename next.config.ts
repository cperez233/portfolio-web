import type { NextConfig } from "next";

/*
  Sin `images.remotePatterns`: el sitio ya no carga imagenes externas.
  Las fotos de Unsplash de Servicios se sustituyeron por diagramas en
  codigo, y todo lo que queda sale de /public. Una fuente externa nueva
  tendria que declararse aqui antes de que next/image la acepte.
*/
const nextConfig: NextConfig = {
  /*
    404 global (app/global-not-found.tsx). Hace falta porque hay dos
    layouts raiz, (en) y (es): sin uno solo, un not-found.tsx normal no
    tiene donde montarse.
  */
  experimental: {
    globalNotFound: true,
  },
  /*
    Cabeceras de seguridad. Sin Content-Security-Policy a proposito: el
    sitio usa scripts en linea (tema, JSON-LD) y Vercel Analytics, y una
    CSP mal calibrada rompe la pagina. HSTS ya lo pone Vercel.
  */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
