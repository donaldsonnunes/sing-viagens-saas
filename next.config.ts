import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Usa standalone apenas quando compilando dentro do Docker
  ...(process.env.DOCKER_BUILD === "true" ? { output: "standalone" } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


