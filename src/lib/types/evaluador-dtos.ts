/**
 * DTOs (Data Transfer Objects) para las pantallas del Evaluador
 * 
 * Estos tipos representan la estructura de datos que las páginas esperan recibir.
 * Temporalmente usan datos mock, pero están diseñados para ser reemplazados
 * por datos reales de la API/Base de Datos.
 */

// ============================================================================
// DASHBOARD DEL EVALUADOR
// ============================================================================

export interface DashboardStats {
  gruposActivos: number;
  examenesPendientes: number;
  alertasEstancamiento: {
    count: number;
    message: string;
  };
}

export interface DashboardStatsV2 {
  alumnosEvaluados: {
    valor: number;
    cambio: string; // "+10%"
    cambioPositivo: boolean;
  };
  promedioGeneral: {
    valor: number; // porcentaje
    cambio: string; // "+5%"
    cambioPositivo: boolean;
  };
  alertasCriticas: {
    valor: number;
    cambio: string; // "-2%"
    cambioPositivo: boolean;
  };
  sugiaActual: {
    nombre: string;
    cambio: string; // "+1%"
    cambioPositivo: boolean;
  };
}

export interface AgendaItem {
  hora: string;
  periodo: 'AM' | 'PM';
  titulo: string;
  tipo: 'examen_oral' | 'revision' | 'diagnostico';
  detalle: string;
  alumnoNombre?: string;
  grupoNombre?: string;
  daf?: string;
}

export interface RecentActivity {
  id: string;
  estudianteNombre: string;
  estudianteAvatarUrl: string;
  examenNombre: string;
  tiempoAtras: string; // "2d", "3d", "4d"
}

export interface CalendarDay {
  dia: number;
  esDiaActual: boolean;
  tieneEvento?: boolean;
}

export interface CalendarMonth {
  mes: string; // "October 2024"
  dias: CalendarDay[];
  primerDiaSemana: number; // 0-6 (domingo = 0)
}

export interface StudentInsight {
  id: string;
  nombre: string;
  avatarUrl?: string;
  iniciales?: string;
  status: 'growing' | 'stable' | 'critical';
  statusLabel: string;
  grupo: string;
  tendencia: {
    porcentaje: number;
    direccion: 'up' | 'down' | 'flat';
  };
  graficoPath: string;
}

export interface EvaluadorDashboardData {
  stats: DashboardStats;
  agendaHoy: AgendaItem[];
  studentInsights: StudentInsight[];
  fechaActual: string;
  evaluador: {
    nombre: string;
    avatarUrl: string;
    tieneNotificaciones: boolean;
  };
}

export interface EvaluadorDashboardDataV2 {
  evaluador: {
    nombre: string;
    avatarUrl: string;
  };
  saludo: string; // "Shalom, Rabbi Levy"
  stats: DashboardStatsV2;
  recentActivity: RecentActivity[];
  calendar: CalendarMonth;
}

// ============================================================================
// REPORTE DE PROGRESO
// ============================================================================

export interface RadarChartData {
  logica: number; // 0-100
  vocabulario: number;
  estructura: number;
  rashi: number;
  arameo: number;
}

export interface ProgresoSemestral {
  mes: string;
  valor: number; // 0-100
}

export interface RecomendacionMore {
  contenido: string;
  more: {
    nombre: string;
    avatarUrl: string;
    cargo: string;
  };
}

export interface ReporteProgresoData {
  alumno: {
    id: string;
    nombre: string;
    avatarUrl: string;
    grupo: string;
    anio: string;
    idEstudiante: string;
  };
  resumenEjecutivo: string;
  habilidadesClave: RadarChartData;
  nivel: 'basico' | 'intermedio' | 'avanzado';
  progresoSemestral: ProgresoSemestral[];
  recomendacionMore: RecomendacionMore;
  fechaGeneracion: string;
}

// ============================================================================
// PERFIL DE DIAGNÓSTICO
// ============================================================================

export interface EvaluacionHistorial {
  id: string;
  fecha: {
    mes: string;
    dia: number;
  };
  titulo: string;
  materia: string;
  puntaje: number;
  nivel: 'sobresaliente' | 'avanzado' | 'bueno' | 'regular' | 'necesita_mejora';
}

export interface NotasAcademicas {
  contenido: string;
  more: {
    nombre: string;
    avatarUrl: string;
    cargo: string;
  };
  fechaActualizacion: string;
}

export interface PerfilDiagnosticoData {
  alumno: {
    id: string;
    nombre: string;
    avatarUrl: string;
    grupo: string;
    anio: string;
    idEstudiante: string;
  };
  mapaHabilidades: RadarChartData;
  historialEvaluaciones: EvaluacionHistorial[];
  notasAcademicas: NotasAcademicas;
}

// ============================================================================
// EVALUACIÓN ACTIVA
// ============================================================================

export interface CriterioLectura {
  fluidez: number; // 1-5 estrellas
  precision: number; // 1-5 estrellas
}

export interface CriterioLogica {
  profundidadAnalisis: number; // 1-10
}

export interface CriterioTraduccion {
  vocabularioArameo: number; // 1-5
}

export interface NotaRapida {
  id: string;
  texto: string;
}

export interface EvaluacionActivaData {
  alumno: {
    id: string;
    nombre: string;
    avatarUrl: string;
    grupo: string;
    sugia: string;
    perek: string;
  };
  tiempoTranscurrido: string; // formato "MM:SS"
  criterios: {
    lectura: CriterioLectura;
    logica: CriterioLogica;
    traduccion: CriterioTraduccion;
  };
  notasRapidas: string;
  notasRapidasSugeridas: string[];
}

// ============================================================================
// CENTRO DE GENERACIÓN DE REPORTES
// ============================================================================

export interface Grupo {
  id: string;
  nombre: string;
  anio: string;
  cantidadEstudiantes: number;
  more: string;
  inicial: string;
}

export type TipoReporte = 'individual' | 'resumen_grupal';

export interface OpcionContenido {
  id: string;
  label: string;
  icono: string;
  seleccionado: boolean;
}

export interface CentroReportesData {
  grupoSeleccionado: Grupo;
  tipoReporte: TipoReporte;
  opcionesContenido: OpcionContenido[];
  cantidadReportes: number;
}

// ============================================================================
// DATOS MOCK TEMPORALES
// ============================================================================

export const mockEvaluadorDashboard: EvaluadorDashboardData = {
  stats: {
    gruposActivos: 4,
    examenesPendientes: 12,
    alertasEstancamiento: {
      count: 3,
      message: '3 alumnos requieren atención inmediata',
    },
  },
  agendaHoy: [
    {
      hora: '09:00',
      periodo: 'AM',
      titulo: 'Examen Oral: Bava Kamma',
      tipo: 'examen_oral',
      detalle: 'Daf 12a',
      alumnoNombre: 'Moshé Levi',
    },
    {
      hora: '10:30',
      periodo: 'AM',
      titulo: 'Revisión de Rashi',
      tipo: 'revision',
      detalle: 'Kitah Vav - B',
      grupoNombre: 'Kitah Vav - B',
    },
    {
      hora: '12:15',
      periodo: 'PM',
      titulo: 'Diagnóstico Individual',
      tipo: 'diagnostico',
      detalle: '',
      alumnoNombre: 'David Cohen',
    },
  ],
  studentInsights: [
    {
      id: '1',
      nombre: 'David Cohen',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArrNOe8MCh-r9hef7YuquGUxswCyET3MS3LtoQdM1mZdNGpZfVYdKl3z7-lKXqEzqhPZH7SRqavXX1egnxIqWlY292BnOb4eBa9kuDc5k-vhtpbFcT2oseIZIbBEImiJrVruWofB8b1fze40EFcInfApUQAO2_Ig1rdqZCplAgahLlAbxOpKZ4Tl_rFWQyQA7I3fIhjnt4pbGpoS9rwA7e4h3gnj83PdPXkAiniSQJd-MWPUo6gkXqOgLsHgQ0qRRcvPLp-XJKVAiE',
      status: 'growing',
      statusLabel: 'Growing',
      grupo: 'Kitah Vav',
      tendencia: {
        porcentaje: 12,
        direccion: 'up',
      },
      graficoPath: 'M0 15 Q10 18 20 10 T50 2',
    },
    {
      id: '2',
      nombre: 'Ariel Benaim',
      iniciales: 'AB',
      status: 'stable',
      statusLabel: 'Stable',
      grupo: 'Kitah Hey',
      tendencia: {
        porcentaje: 1,
        direccion: 'flat',
      },
      graficoPath: 'M0 10 L10 10 L20 8 L30 12 L40 10 L50 10',
    },
    {
      id: '3',
      nombre: 'Shimon Peretz',
      iniciales: 'SP',
      status: 'critical',
      statusLabel: 'Critical',
      grupo: 'Kitah Vav',
      tendencia: {
        porcentaje: -8,
        direccion: 'down',
      },
      graficoPath: 'M0 5 Q10 5 20 12 T50 18',
    },
  ],
  fechaActual: '15 de Marzo, 2024',
  evaluador: {
    nombre: 'Evaluador',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkfXQYj_pitBy9zQeYmLcd_QhcXqDffwWd0NNcVNPlIamPea3FcSuV5obf_vQCNwASWa1QrQcP0Iri-yy0RofIFujKX6ZmbudrjOOflcYn6B_PXQfC8jwNisdKBES-W_oGoNJDWsxA1VzjFM7ftrHekRVEUR9pUAFEgcoE0zKiJJta8WEGaNj9m5W15zTZN3Cerg1ArhaopNXDP_Ga8WbxdGnIx2qzm-ElIVK3VtGUx1zndBlM_6_XpCOGkHuWu9UDga0q2LVjW4Ma',
    tieneNotificaciones: true,
  },
};

export const mockReporteProgreso: ReporteProgresoData = {
  alumno: {
    id: '882910',
    nombre: 'David Cohen',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArrNOe8MCh-r9hef7YuquGUxswCyET3MS3LtoQdM1mZdNGpZfVYdKl3z7-lKXqEzqhPZH7SRqavXX1egnxIqWlY292BnOb4eBa9kuDc5k-vhtpbFcT2oseIZIbBEImiJrVruWofB8b1fze40EFcInfApUQAO2_Ig1rdqZCplAgahLlAbxOpKZ4Tl_rFWQyQA7I3fIhjnt4pbGpoS9rwA7e4h3gnj83PdPXkAiniSQJd-MWPUo6gkXqOgLsHgQ0qRRcvPLp-XJKVAiE',
    grupo: 'Kitah Vav',
    anio: '2024',
    idEstudiante: '882910',
  },
  resumenEjecutivo:
    'David ha demostrado un crecimiento excepcional en la comprensión de la lógica talmúdica (Svarah). Su capacidad para decodificar términos en arameo ha mejorado significativamente, mostrando mayor independencia en el aprendizaje de la Sugya. Aunque su participación es activa, se recomienda práctica adicional enfocada en las estructuras complejas de Rashi para consolidar su autonomía.',
  habilidadesClave: {
    logica: 85,
    vocabulario: 75,
    estructura: 70,
    rashi: 65,
    arameo: 60,
  },
  nivel: 'avanzado',
  progresoSemestral: [
    { mes: 'Oct', valor: 30 },
    { mes: 'Nov', valor: 35 },
    { mes: 'Dic', valor: 60 },
    { mes: 'Ene', valor: 70 },
    { mes: 'Feb', valor: 85 },
    { mes: 'Mar', valor: 95 },
  ],
  recomendacionMore: {
    contenido:
      'Se sugiere repasar vocabulario arameo 15 minutos al día. Enfocarse en las palabras clave de la Mishná para mejorar la fluidez en la lectura.',
    more: {
      nombre: 'Rav Yosef Levy',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkfXQYj_pitBy9zQeYmLcd_QhcXqDffwWd0NNcVNPlIamPea3FcSuV5obf_vQCNwASWa1QrQcP0Iri-yy0RofIFujKX6ZmbudrjOOflcYn6B_PXQfC8jwNisdKBES-W_oGoNJDWsxA1VzjFM7ftrHekRVEUR9pUAFEgcoE0zKiJJta8WEGaNj9m5W15zTZN3Cerg1ArhaopNXDP_Ga8WbxdGnIx2qzm-ElIVK3VtGUx1zndBlM_6_XpCOGkHuWu9UDga0q2LVjW4Ma',
      cargo: 'Coordinador de Estudios',
    },
  },
  fechaGeneracion: '15 de Marzo, 2024',
};

export const mockPerfilDiagnostico: PerfilDiagnosticoData = {
  alumno: {
    id: '882910',
    nombre: 'David Cohen',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArrNOe8MCh-r9hef7YuquGUxswCyET3MS3LtoQdM1mZdNGpZfVYdKl3z7-lKXqEzqhPZH7SRqavXX1egnxIqWlY292BnOb4eBa9kuDc5k-vhtpbFcT2oseIZIbBEImiJrVruWofB8b1fze40EFcInfApUQAO2_Ig1rdqZCplAgahLlAbxOpKZ4Tl_rFWQyQA7I3fIhjnt4pbGpoS9rwA7e4h3gnj83PdPXkAiniSQJd-MWPUo6gkXqOgLsHgQ0qRRcvPLp-XJKVAiE',
    grupo: 'Kitah Vav',
    anio: '2024',
    idEstudiante: '882910',
  },
  mapaHabilidades: {
    logica: 85,
    vocabulario: 75,
    estructura: 70,
    rashi: 65,
    arameo: 60,
  },
  historialEvaluaciones: [
    {
      id: '1',
      fecha: { mes: 'Mar', dia: 15 },
      titulo: 'HaMefakid',
      materia: 'Talmud Bava Metzia',
      puntaje: 95,
      nivel: 'sobresaliente',
    },
    {
      id: '2',
      fecha: { mes: 'Feb', dia: 28 },
      titulo: 'Eilu Metziot',
      materia: 'Mishná - Comprensión',
      puntaje: 88,
      nivel: 'avanzado',
    },
    {
      id: '3',
      fecha: { mes: 'Feb', dia: 10 },
      titulo: 'Shakla V\'Tarya',
      materia: 'Estructura Lógica',
      puntaje: 92,
      nivel: 'sobresaliente',
    },
    {
      id: '4',
      fecha: { mes: 'Ene', dia: 22 },
      titulo: 'Vocabulario Básico',
      materia: 'Arameo - Prueba Escrita',
      puntaje: 82,
      nivel: 'bueno',
    },
  ],
  notasAcademicas: {
    contenido:
      'David muestra una comprensión profunda de la "Shakla V\'Tarya" (la discusión del Talmud). Su capacidad para identificar los pasos lógicos ha mejorado notablemente este mes. Se recomienda enfocar el estudio en casa en la traducción precisa de Rashi para complementar su análisis lógico.',
    more: {
      nombre: 'Rav Yosef Levy',
      avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkfXQYj_pitBy9zQeYmLcd_QhcXqDffwWd0NNcVNPlIamPea3FcSuV5obf_vQCNwASWa1QrQcP0Iri-yy0RofIFujKX6ZmbudrjOOflcYn6B_PXQfC8jwNisdKBES-W_oGoNJDWsxA1VzjFM7ftrHekRVEUR9pUAFEgcoE0zKiJJta8WEGaNj9m5W15zTZN3Cerg1ArhaopNXDP_Ga8WbxdGnIx2qzm-ElIVK3VtGUx1zndBlM_6_XpCOGkHuWu9UDga0q2LVjW4Ma',
      cargo: 'Coordinador de Estudios',
    },
    fechaActualizacion: 'ayer',
  },
};

export const mockEvaluacionActiva: EvaluacionActivaData = {
  alumno: {
    id: '882910',
    nombre: 'David Cohen',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArrNOe8MCh-r9hef7YuquGUxswCyET3MS3LtoQdM1mZdNGpZfVYdKl3z7-lKXqEzqhPZH7SRqavXX1egnxIqWlY292BnOb4eBa9kuDc5k-vhtpbFcT2oseIZIbBEImiJrVruWofB8b1fze40EFcInfApUQAO2_Ig1rdqZCplAgahLlAbxOpKZ4Tl_rFWQyQA7I3fIhjnt4pbGpoS9rwA7e4h3gnj83PdPXkAiniSQJd-MWPUo6gkXqOgLsHgQ0qRRcvPLp-XJKVAiE',
    grupo: 'Sugiá',
    sugia: 'Baba Metzia',
    perek: 'Perek 2',
  },
  tiempoTranscurrido: '14:32',
  criterios: {
    lectura: {
      fluidez: 4,
      precision: 3,
    },
    logica: {
      profundidadAnalisis: 8,
    },
    traduccion: {
      vocabularioArameo: 4,
    },
  },
  notasRapidas: '',
  notasRapidasSugeridas: ['+ Falta fluidez', '+ Buen vocabulario', '+ Excelente lógica'],
};

export const mockCentroReportes: CentroReportesData = {
  grupoSeleccionado: {
    id: '1',
    nombre: 'Kitah Vav',
    anio: '2024',
    cantidadEstudiantes: 24,
    more: 'Rabbi Levy',
    inicial: 'V',
  },
  tipoReporte: 'individual',
  opcionesContenido: [
    {
      id: 'radar',
      label: 'Gráfico Radar (Habilidades)',
      icono: 'radar',
      seleccionado: true,
    },
    {
      id: 'progreso',
      label: 'Progreso Semestral',
      icono: 'monitoring',
      seleccionado: true,
    },
    {
      id: 'asistencia',
      label: 'Registro de Asistencia',
      icono: 'calendar_month',
      seleccionado: false,
    },
    {
      id: 'recomendaciones',
      label: 'Recomendaciones del Moré',
      icono: 'lightbulb',
      seleccionado: true,
    },
  ],
  cantidadReportes: 24,
};

export const mockEvaluadorDashboardV2: EvaluadorDashboardDataV2 = {
  evaluador: {
    nombre: 'Rabbi Levy',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCAekcpChBr0il_9UInsOqTyYN87QpMGf6ctOUSaVF7Qr5qjLjSpWnfk_GQXMkx1ng91RxSXZjMI2QOn_asLMLEPElTEIsvIyrRwrvFy3Xe8o54xbFizrgoIjuQ1wxN-y5ofnTWZhE3YBUjXs6Olr4yicHODOvejpRpH3BwZej5ciVbKtRuUSDmITc7oKSHm2qHh6Wo765IJcWmrhebFZaqOR4GwNJFATE53Ec6FS1VzGw2DY_UuaG-eWsh-7Pb-Mr1sq2--GIi7rzN',
  },
  saludo: 'Shalom, Rabbi Levy',
  stats: {
    alumnosEvaluados: {
      valor: 125,
      cambio: '+10%',
      cambioPositivo: true,
    },
    promedioGeneral: {
      valor: 88,
      cambio: '+5%',
      cambioPositivo: true,
    },
    alertasCriticas: {
      valor: 3,
      cambio: '-2%',
      cambioPositivo: true,
    },
    sugiaActual: {
      nombre: 'Berachot',
      cambio: '+1%',
      cambioPositivo: true,
    },
  },
  recentActivity: [
    {
      id: '1',
      estudianteNombre: 'Student A',
      estudianteAvatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBS4MDNyIDKdMtxTrwRCNNqOE8SYgg5ID36E_kTIVoW-hY4ylOIc8ndWCsnybBRUPpDg0u9jkepHSmOMmUTkDxi5Qa-NrLL3gaR_9haK08eKfYNtgST4BOnnFgBsYQOiWGzKdNirJ-YDhqgo2SyCPRI-qLbf2LjvfJ7LkrmU_skQ18XM5YQQVJQ9p5MZSevBJk53XJ1r90MdltYZS8cSyk-o7fJbaAowWnfdQgdzcwv5IeA17LmI1sJXHb0ypx0yK9QD-aUN-xzRi7N',
      examenNombre: 'Exam 1',
      tiempoAtras: '2d',
    },
    {
      id: '2',
      estudianteNombre: 'Student B',
      estudianteAvatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBuvlJeP7krugKewPg2JQ-acstHE7fJXSpPTDOsbomHONGxlAOUXKbbmhEcE494uol4kwYwzIffIOgpiMvG4KnV3ByL275PbywEN_Ot_mOtSHdAOUTTPknKI744N2xeFYWJoPiwdwpw5woy_d7PifAadlc16tKLdHeFfhZE4UO0GN2Qq_T2I712OpMvWX1Ahi__tpwsoGUICzuV-D5c7-29Kosr8i-eV--k_0U1JwhN0Yh7eG-CnxUA0zJp5N9Q9fcdcyAzLi0FHmkM',
      examenNombre: 'Exam 2',
      tiempoAtras: '3d',
    },
    {
      id: '3',
      estudianteNombre: 'Student C',
      estudianteAvatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDKYF4VOdE4YqYVQJvx04VV30mhkckp7jroiihFim6QLL5xYS2Xmbj2nQJH2_CFYC9cvPm7Z3Yfw8hrB1Lv6WtnjzA6n4z7py-13Z23krdFuv272Fc-ma7tch-GEugo77ZYj6Krn4muh9Gc-SrCPIUA_DfTpPfQGowDvo3aUearUwa4xYHCPhH7ZVyH1NOEAn9Bt--Fd8nmq230pxRVushZmV9BIO4EzbfwbPL1Z17R_P1CSMgDAu6Tmg2UTBRxIIqy6N3AkPk8fh8Z',
      examenNombre: 'Exam 3',
      tiempoAtras: '4d',
    },
  ],
  calendar: {
    mes: 'October 2024',
    primerDiaSemana: 3, // Miércoles (0 = domingo)
    dias: [
      { dia: 1, esDiaActual: false },
      { dia: 2, esDiaActual: false },
      { dia: 3, esDiaActual: false },
      { dia: 4, esDiaActual: false },
      { dia: 5, esDiaActual: true }, // Día actual
      { dia: 6, esDiaActual: false },
      { dia: 7, esDiaActual: false },
      { dia: 8, esDiaActual: false },
      { dia: 9, esDiaActual: false },
      { dia: 10, esDiaActual: false },
      { dia: 11, esDiaActual: false },
      { dia: 12, esDiaActual: false },
      { dia: 13, esDiaActual: false },
      { dia: 14, esDiaActual: false },
      { dia: 15, esDiaActual: false },
      { dia: 16, esDiaActual: false },
      { dia: 17, esDiaActual: false },
      { dia: 18, esDiaActual: false },
      { dia: 19, esDiaActual: false },
      { dia: 20, esDiaActual: false },
      { dia: 21, esDiaActual: false },
      { dia: 22, esDiaActual: false },
      { dia: 23, esDiaActual: false },
      { dia: 24, esDiaActual: false },
      { dia: 25, esDiaActual: false },
      { dia: 26, esDiaActual: false },
      { dia: 27, esDiaActual: false },
      { dia: 28, esDiaActual: false },
      { dia: 29, esDiaActual: false },
      { dia: 30, esDiaActual: false },
    ],
  },
};
