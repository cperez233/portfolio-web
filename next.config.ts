import type { NextConfig } from "next";

/*
  Sin `images.remotePatterns`: el sitio ya no carga imagenes externas.
  Las fotos de Unsplash de Servicios se sustituyeron por diagramas en
  codigo, y todo lo que queda sale de /public. Una fuente externa nueva
  tendria que declararse aqui antes de que next/image la acepte.
*/
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://js.hcaptcha.com https://*.hcaptcha.com",
  "style-src 'self' 'unsafe-inline' https://*.hcaptcha.com",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob:",
  "frame-src https://*.hcaptcha.com",
  "connect-src 'self' https://api.web3forms.com https://*.hcaptcha.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

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
    Cabeceras de seguridad. La CSP ya se aplica (antes iba en Report-Only):
    se probo el sitio completo, con el formulario y hCaptcha, sin una sola
    violacion. Los scripts en linea (tema, JSON-LD, hidratacion de Next)
    obligan a 'unsafe-inline'; pasar a nonces es el paso siguiente.
    Si una fuente nueva queda bloqueada, anadela arriba. HSTS ya lo pone
    Vercel.
  */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
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
