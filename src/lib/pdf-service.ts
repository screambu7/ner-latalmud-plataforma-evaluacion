/**
 * Servicio de Generación de PDF - Ner LaTalmud
 * 
 * Genera PDFs a partir de HTML usando Playwright.
 * 
 * Arquitectura:
 * - Renderiza HTML real (no plantillas nuevas)
 * - Usa payload guardado del reporte (no recalcula)
 * - Guarda archivo y metadata en tabla Archivo
 * - Versiona PDFs (cada generación crea nuevo archivo)
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import type { ReporteProgresoData } from './types/evaluador-dtos';

// Import dinámico de Playwright para evitar errores en build si no está disponible
// En Vercel, Playwright se instala automáticamente durante el build
type Browser = any; // Tipo para evitar errores de TypeScript

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Directorio base para almacenar PDFs.
 * 
 * ⚠️ TODO: Configurar desde variable de entorno.
 */
const PDF_STORAGE_DIR = process.env.PDF_STORAGE_DIR || './storage/pdfs';

/**
 * URL base de la aplicación para renderizar páginas.
 * 
 * ⚠️ TODO: Configurar desde variable de entorno.
 */
const APP_BASE_URL =
  process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ============================================
// TIPOS
// ============================================

export interface PDFGenerationOptions {
  /** Datos del reporte a renderizar */
  data: ReporteProgresoData;
  
  /** ID del reporte (para versionado) */
  reporteId: number;
  
  /** Nombre del archivo (sin extensión) */
  nombreArchivo?: string;
}

export interface PDFGenerationResult {
  /** Ruta del archivo generado (relativa al storage) */
  ruta: string;
  
  /** Nombre del archivo generado */
  nombreArchivo: string;
  
  /** Tamaño del archivo en bytes */
  tamaño: number;
  
  /** MIME type del archivo */
  mimeType: string;
}

// ============================================
// SERVICIO DE GENERACIÓN
// ============================================

/**
 * Genera un PDF a partir de datos de reporte.
 * 
 * El PDF es una réplica fiel del HTML del reporte de progreso,
 * usando los datos del payload guardado (no recalcula).
 * 
 * @param options - Opciones de generación
 * @returns Resultado con ruta y metadata del archivo
 */
export async function generarPDFReporte(
  options: PDFGenerationOptions
): Promise<PDFGenerationResult> {
  let browser: Browser | null = null;

  try {
    // Import dinámico de Playwright (solo se carga cuando se ejecuta la función)
    // En Vercel, Playwright se instala automáticamente durante el build
    // Usar función helper para evitar análisis estático de TypeScript
    const playwrightModule = await (async () => {
      try {
        // @ts-expect-error - Playwright se carga dinámicamente, no disponible en build time
        return await import('playwright');
      } catch (error) {
        throw new Error(
          'Playwright no está disponible. ' +
          'Asegúrate de que Playwright esté instalado: npm install playwright'
        );
      }
    })();
    const { chromium } = playwrightModule;
    
    // Asegurar que el directorio de storage existe
    await mkdir(PDF_STORAGE_DIR, { recursive: true });

    // Generar nombre de archivo único
    const timestamp = Date.now();
    const nombreArchivo = options.nombreArchivo || `reporte-${options.reporteId}-${timestamp}`;
    const nombreCompleto = `${nombreArchivo}.pdf`;
    const rutaCompleta = join(PDF_STORAGE_DIR, nombreCompleto);

    // Inicializar Playwright
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Configurar viewport para PDF
    await page.setViewportSize({ width: 800, height: 1200 });

    // Generar HTML del reporte
    const html = generarHTMLReporte(options.data);

    // Cargar HTML en la página
    await page.setContent(html, {
      waitUntil: 'networkidle',
    });

    // Esperar a que los SVG y gráficos se rendericen
    await page.waitForTimeout(1000);

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5cm',
        right: '0.5cm',
        bottom: '0.5cm',
        left: '0.5cm',
      },
    });

    // Guardar archivo
    await writeFile(rutaCompleta, pdfBuffer);

    // Obtener tamaño del archivo
    const tamaño = pdfBuffer.length;

    return {
      ruta: nombreCompleto, // Ruta relativa para guardar en BD
      nombreArchivo: nombreCompleto,
      tamaño,
      mimeType: 'application/pdf',
    };
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error(`Error al generar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Genera el HTML del reporte a partir de los datos.
 * 
 * Este HTML es una réplica exacta del componente React del reporte,
 * pero renderizado como HTML estático para PDF.
 * 
 * @param data - Datos del reporte
 * @returns HTML completo del reporte
 */
function generarHTMLReporte(data: ReporteProgresoData): string {
  // Calcular coordenadas del radar
  const radarToCoords = (value: number, index: number, radius: number = 80) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const normalizedValue = value / 100;
    const x = 100 + radius * normalizedValue * Math.cos(angle);
    const y = 100 + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  };

  const habilidades = [
    data.habilidadesClave.logica,
    data.habilidadesClave.vocabulario,
    data.habilidadesClave.estructura,
    data.habilidadesClave.rashi,
    data.habilidadesClave.arameo,
  ];

  const coords = habilidades.map((val, idx) => radarToCoords(val, idx));
  const radarPath = `M${coords[0].x} ${coords[0].y} L${coords[1].x} ${coords[1].y} L${coords[2].x} ${coords[2].y} L${coords[3].x} ${coords[3].y} L${coords[4].x} ${coords[4].y} Z`;

  const nivelLabel =
    data.nivel === 'avanzado'
      ? 'Avanzado'
      : data.nivel === 'intermedio'
        ? 'Intermedio'
        : 'Básico';

  // Generar puntos del gráfico de progreso
  const progresoPoints = data.progresoSemestral
    .map((item, idx) => {
      const x = 30 + idx * 50;
      const y = 130 - item.valor;
      return { x, y, mes: item.mes, valor: item.valor };
    })
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x} ${p.y}`)
    .join(' ');

  const progresoAreaPath = `${progresoPoints} V130 H30 Z`;

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Académico - ${data.alumno.nombre}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;600;700&family=Noto+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet">
  <style>
    body {
      font-family: 'Lexend', 'Noto Sans', sans-serif;
      background-color: #f8fafc;
    }
    .bg-paper {
      background-color: #ffffff;
    }
    .text-primary {
      color: #2111d4;
    }
    .bg-primary {
      background-color: #2111d4;
    }
    .border-primary {
      border-color: #2111d4;
    }
    .shadow-paper {
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
    }
  </style>
</head>
<body>
  <div class="relative flex flex-col w-full bg-paper" style="font-family: 'Lexend', 'Noto Sans', sans-serif;">
    <!-- Student Profile Header -->
    <div class="flex flex-col items-center pt-6 pb-6 px-4">
      <div class="relative mb-4">
        <div class="relative bg-center bg-no-repeat bg-cover rounded-full h-28 w-28 border-4 border-paper shadow-sm" style="background-image: url('${data.alumno.avatarUrl}')"></div>
        <div class="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-neutral-100">
          <span class="material-symbols-outlined text-primary text-[18px] block">school</span>
        </div>
      </div>
      <div class="text-center space-y-1">
        <h1 class="text-[#0f0d1b] text-2xl font-bold leading-tight tracking-[-0.015em]">
          ${data.alumno.nombre}
        </h1>
        <p class="text-primary font-medium text-sm tracking-wide">
          ${data.alumno.grupo} - ${data.alumno.anio} <span class="mx-1 opacity-50">|</span> Ner LaTalmud
        </p>
        <p class="text-slate-500 text-xs font-normal">ID Estudiante: ${data.alumno.idEstudiante}</p>
      </div>
    </div>

    <div class="px-4">
      <hr class="border-neutral-200" />
    </div>

    <!-- Executive Summary -->
    <div class="pt-6 px-5">
      <div class="flex items-center gap-2 mb-3">
        <span class="material-symbols-outlined text-primary text-[20px]">article</span>
        <h2 class="text-[#0f0d1b] text-lg font-bold leading-tight">Resumen Ejecutivo</h2>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-paper border border-neutral-100">
        <p class="text-slate-700 text-[15px] font-normal leading-relaxed text-justify">
          ${data.resumenEjecutivo}
        </p>
      </div>
    </div>

    <!-- Skills Radar Chart -->
    <div class="pt-8 px-5">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined text-primary text-[20px]">radar</span>
          <h2 class="text-[#0f0d1b] text-lg font-bold leading-tight">Habilidades Clave</h2>
        </div>
        <span class="text-xs font-semibold bg-primary/10 text-primary px-2 py-1 rounded">
          Nivel ${nivelLabel}
        </span>
      </div>
      <div class="bg-white p-6 rounded-xl shadow-paper border border-neutral-100 flex flex-col items-center justify-center">
        <div class="relative w-64 h-64">
          <svg class="w-full h-full drop-shadow-sm" viewBox="0 0 200 200">
            <!-- Background Grid (Pentagon) -->
            <g class="stroke-neutral-200 stroke-1 fill-none">
              <path d="M100 20 L176 75 L147 165 H53 L24 75 Z"></path>
              <path d="M100 52 L145 85 L128 139 H72 L55 85 Z"></path>
              <path d="M100 84 L115 95 L109 113 H91 L85 95 Z"></path>
            </g>
            <!-- Axes -->
            <g class="stroke-neutral-200 stroke-[0.5]">
              <line x1="100" x2="100" y1="100" y2="20"></line>
              <line x1="100" x2="176" y1="100" y2="75"></line>
              <line x1="100" x2="147" y1="100" y2="165"></line>
              <line x1="100" x2="53" y1="100" y2="165"></line>
              <line x1="100" x2="24" y1="100" y2="75"></line>
            </g>
            <!-- Data Shape -->
            <path class="fill-primary/20 stroke-primary stroke-2" d="${radarPath}"></path>
            <!-- Data Points -->
            ${coords
              .map(
                (coord) =>
                  `<circle class="fill-primary" cx="${coord.x}" cy="${coord.y}" r="3"></circle>`
              )
              .join('')}
          </svg>
          <!-- Labels -->
          <span class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">Lógica</span>
          <span class="absolute top-[35%] right-0 translate-x-1 text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">Vocabulario</span>
          <span class="absolute bottom-[15%] right-[10%] text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">Estructura</span>
          <span class="absolute bottom-[15%] left-[10%] text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">Rashi</span>
          <span class="absolute top-[35%] left-0 -translate-x-3 text-xs font-bold text-slate-700 bg-white/80 px-1 rounded">Arameo</span>
        </div>
        <p class="text-xs text-slate-400 mt-4 text-center">
          Datos basados en evaluaciones mensuales.
        </p>
      </div>
    </div>

    <!-- Timeline Progress -->
    <div class="pt-8 px-5">
      <div class="flex items-center gap-2 mb-4">
        <span class="material-symbols-outlined text-primary text-[20px]">monitoring</span>
        <h2 class="text-[#0f0d1b] text-lg font-bold leading-tight">Progreso Semestral</h2>
      </div>
      <div class="bg-white p-5 rounded-xl shadow-paper border border-neutral-100">
        <div class="w-full h-40">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 300 150">
            <!-- Grid Lines -->
            <line class="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="130" y2="130"></line>
            <line class="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="90" y2="90"></line>
            <line class="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="50" y2="50"></line>
            <line class="stroke-neutral-100 stroke-1" x1="0" x2="300" y1="10" y2="10"></line>
            <!-- Path -->
            <path class="fill-none stroke-primary stroke-3" d="${progresoPoints}"></path>
            <!-- Area Gradient -->
            <defs>
              <linearGradient id="gradientArea" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#2111d4" stop-opacity="0.2"></stop>
                <stop offset="100%" stop-color="#2111d4" stop-opacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="${progresoAreaPath}" fill="url(#gradientArea)"></path>
            <!-- Dots -->
            ${data.progresoSemestral
              .map((item, idx) => {
                const x = 30 + idx * 50;
                const y = 130 - item.valor;
                return `<circle class="fill-white stroke-primary stroke-2" cx="${x}" cy="${y}" r="4"></circle>`;
              })
              .join('')}
            <!-- Labels X Axis -->
            ${data.progresoSemestral
              .map((item, idx) => {
                const x = 30 + idx * 50;
                const isLast = idx === data.progresoSemestral.length - 1;
                return `<text class="fill-slate-400 text-[10px] font-sans ${isLast ? 'font-bold text-primary' : ''}" text-anchor="middle" x="${x}" y="145">${item.mes}</text>`;
              })
              .join('')}
          </svg>
        </div>
      </div>
    </div>

    <!-- Teacher's Recommendation -->
    <div class="pt-8 px-5 pb-8">
      <div class="bg-[#F0F4FF] rounded-xl border border-primary/20 overflow-hidden relative">
        <div class="absolute top-0 left-0 w-1 h-full bg-primary"></div>
        <div class="p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="bg-primary text-white p-1.5 rounded-lg">
              <span class="material-symbols-outlined text-[18px] block">lightbulb</span>
            </div>
            <h3 class="text-[#0f0d1b] text-base font-bold leading-tight">
              Recomendación del Moré
            </h3>
          </div>
          <p class="text-slate-700 text-sm font-normal leading-relaxed mb-4">
            ${data.recomendacionMore.contenido}
          </p>
          <div class="flex items-center gap-2">
            <div class="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 border border-white shadow-sm" style="background-image: url('${data.recomendacionMore.more.avatarUrl}')"></div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-800">${data.recomendacionMore.more.nombre}</span>
              <span class="text-[10px] text-slate-500">${data.recomendacionMore.more.cargo}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Official Footer -->
    <div class="mt-auto px-5 pb-10 pt-4 border-t border-neutral-200">
      <div class="flex flex-col items-center justify-center opacity-80">
        <div class="w-24 h-24 mb-4 relative opacity-90">
          <svg class="w-full h-full fill-primary/10 stroke-primary/30 stroke-1" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48"></circle>
            <circle class="stroke-dashed stroke-primary/20" cx="50" cy="50" r="40" stroke-dasharray="4 2"></circle>
            <path class="fill-primary/20" d="M50 25 L60 40 L50 65 L40 40 Z"></path>
            <text class="text-[8px] fill-primary font-serif font-bold tracking-widest uppercase" text-anchor="middle" x="50" y="85">Ner LaTalmud</text>
          </svg>
        </div>
        <div class="w-48 border-b border-slate-300 mb-2"></div>
        <p class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
          Firma Autorizada
        </p>
        <p class="text-[10px] text-slate-300 mt-1">Generado el ${data.fechaGeneracion}</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}
