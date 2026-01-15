/**
 * Utilidades para el gráfico radar
 * 
 * Estas funciones calculan las coordenadas del radar chart.
 * Deben ser llamadas ANTES de pasar datos al componente.
 */

export interface RadarCoordinate {
  x: number;
  y: number;
}

/**
 * Convierte valores de habilidades a coordenadas del radar
 * 
 * @param habilidades - Array de valores (0-100) en orden: logica, vocabulario, estructura, rashi, arameo
 * @param radius - Radio del radar (default: 80)
 * @returns Array de coordenadas {x, y}
 */
export function calcularCoordenadasRadar(
  habilidades: number[],
  radius: number = 80
): RadarCoordinate[] {
  return habilidades.map((value, index) => {
    const angle = (index * 2 * Math.PI) / 5 - Math.PI / 2;
    const normalizedValue = value / 100;
    const x = 100 + radius * normalizedValue * Math.cos(angle);
    const y = 100 + radius * normalizedValue * Math.sin(angle);
    return { x, y };
  });
}

/**
 * Genera el path SVG del polígono del radar
 * 
 * @param coordenadas - Array de coordenadas {x, y}
 * @returns String del path SVG
 */
export function generarRadarPath(coordenadas: RadarCoordinate[]): string {
  if (coordenadas.length === 0) return '';
  
  const pathParts = coordenadas.map((coord, idx) => {
    return idx === 0 ? `M${coord.x} ${coord.y}` : `L${coord.x} ${coord.y}`;
  });
  
  return `${pathParts.join(' ')} Z`;
}
