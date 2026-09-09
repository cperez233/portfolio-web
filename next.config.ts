import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // CDN de Unsplash: servir desde aqui es su uso previsto,
        // a diferencia del hotlinking a sitios de terceros.
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
