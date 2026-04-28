import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const configDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {
    root: configDir,
  },

  // Ускорение разработки
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-slot"],
  },

  // Отключаем лишние проверки для dev
  typescript: {
    ignoreBuildErrors: false,
  },

  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "www.omdbapi.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "ia.media-imdb.com",
      },
    ],
  },
};

export default nextConfig;
