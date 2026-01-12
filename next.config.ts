import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Vercel
  // Playwright se usa solo en server-side (pdf-service.ts)
  
  // Excluir Playwright del bundle de server components
  // Playwright se carga dinámicamente solo cuando se genera un PDF
  // Esto evita errores en build ya que Playwright requiere instalación de browsers
  serverExternalPackages: ['playwright'],
  
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
