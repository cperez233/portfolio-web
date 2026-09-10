import type { NextConfig } from "next";

/*
  Sin `images.remotePatterns`: el sitio ya no carga imagenes externas.
  Las fotos de Unsplash de Servicios se sustituyeron por diagramas en
  codigo, y todo lo que queda sale de /public. Una fuente externa nueva
  tendria que declararse aqui antes de que next/image la acepte.
*/
const nextConfig: NextConfig = {};

export default nextConfig;
