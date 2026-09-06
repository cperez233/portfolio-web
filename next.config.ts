import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosts externos usados por el marquee y los assets 3D del about.
    // Son dominios de terceros: si dejan de servir, las imagenes caen.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "motionsites.ai",
        pathname: "/assets/**",
      },
      {
        protocol: "https",
        hostname: "shrug-person-78902957.figma.site",
        pathname: "/_components/**",
      },
    ],
  },
};

export default nextConfig;
