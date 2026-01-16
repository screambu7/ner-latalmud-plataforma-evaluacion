/**
 * Design System Canon - Ner LaTalmud
 * 
 * Tokens centralizados del sistema de diseño.
 * Todos los colores, tipografías, sombras y radios deben usar estos tokens.
 * 
 * ⚠️ NO usar valores hardcodeados en componentes.
 * ⚠️ NO crear variantes fuera de este archivo.
 */

export const designTokens = {
  // ============================================
  // COLORES PRINCIPALES (Design System Canon)
  // ============================================
  colors: {
    // Paleta oficial: Negro, Amarillo, Naranja, Blanco
    // Color primario oficial (Negro)
    primary: '#000000',
    primaryDark: '#000000',
    primaryLight: '#1A1A1A',
    
    // Colores de la paleta
    black: '#000000',
    yellow: '#f6aa1b',
    orange: '#ed6738',
    white: '#ffffff',
    
    // Fondo principal (Blanco)
    paper: '#ffffff',
    
    // Colores semánticos (mapeados a la nueva paleta)
    success: '#f6aa1b', // Amarillo para éxito
    error: '#ed6738',   // Naranja para errores
    warning: '#f6aa1b',  // Amarillo para advertencias
    info: '#000000',     // Negro para información
    
    // Colores de texto
    textPrimary: '#000000',
    textSecondary: '#4A4A4A',
    textTertiary: '#6B6B6B',
    textInverse: '#FFFFFF',
    
    // Colores de fondo
    backgroundLight: '#F5F5F5',
    backgroundCard: '#FAFAFA',
    backgroundWhite: '#FFFFFF',
    
    // Colores de estado (para badges, estados, etc.)
    statusActive: '#f6aa1b',
    statusInactive: '#ed6738',
    statusPaused: '#f6aa1b',
    statusCompleted: '#000000',
    
    // Colores de borde
    borderLight: '#E0E0E0',
    borderMedium: '#CCCCCC',
    borderDark: '#999999',
    
    // Colores de alerta (variantes de error/warning/info)
    alertError: '#ed6738',
    alertErrorBg: '#FFF4F0',
    alertErrorBorder: '#FFD4C4',
    alertWarning: '#f6aa1b',
    alertWarningBg: '#FFFBF0',
    alertWarningBorder: '#FFE8B8',
    alertSuccess: '#f6aa1b',
    alertSuccessBg: '#FFFBF0',
    alertSuccessBorder: '#FFE8B8',
    alertInfo: '#000000',
    alertInfoBg: '#F5F5F5',
    alertInfoBorder: '#E0E0E0',
  },

  // ============================================
  // TIPOGRAFÍA (Design System Canon)
  // ============================================
  typography: {
    // Fuentes
    fontDisplay: 'Lexend, sans-serif',
    fontBody: 'Noto Sans, sans-serif',
    
    // Tamaños
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    
    // Pesos
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    // Alturas de línea
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },

  // ============================================
  // RADIOS (Border Radius)
  // ============================================
  radius: {
    none: '0',
    sm: '0.125rem',   // 2px
    default: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    full: '9999px',
  },

  // ============================================
  // SOMBRAS
  // ============================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    // Sombras con color primario (Negro)
    primary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    primaryLg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    primaryXl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  },

  // ============================================
  // ESPACIADO (Spacing)
  // ============================================
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },
} as const;

/**
 * Helper para obtener valores de tokens como strings CSS
 */
export const tokens = {
  color: (key: keyof typeof designTokens.colors) => designTokens.colors[key],
  fontSize: (key: keyof typeof designTokens.typography.fontSize) => designTokens.typography.fontSize[key],
  fontWeight: (key: keyof typeof designTokens.typography.fontWeight) => designTokens.typography.fontWeight[key],
  radius: (key: keyof typeof designTokens.radius) => designTokens.radius[key],
  shadow: (key: keyof typeof designTokens.shadows) => designTokens.shadows[key],
  spacing: (key: keyof typeof designTokens.spacing) => designTokens.spacing[key],
} as const;
