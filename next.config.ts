import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel
  // Playwright se usa solo en server-side (pdf-service.ts)
  // No necesita configuración especial en Next.js
  
  // Asegurar que las variables de entorno se pasen correctamente
  env: {
    // Variables que se exponen al cliente (si es necesario)
    // La mayoría de variables son server-only
  },
  
  // Configuración de build
  experimental: {
    // Optimizaciones para producción
  },
};

export default nextConfig;
