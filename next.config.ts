import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Ускорение разработки
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-slot"],
  },

  // Отключаем лишние проверки для dev
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Оптимизация изображений
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "http",
        hostname: "**.omdbapi.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
    ],
  },
};

export default nextConfig;
