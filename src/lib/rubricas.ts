export type Nivel = 1 | 2 | 3 | 4;

export interface Subhabilidad {
  key: string;
  label: string;
  aplicaATipos: string[];
}

export const SUBHABILIDADES: Subhabilidad[] = [
  {
    key: 'lectura_basica',
    label: 'Lectura básica',
    aplicaATipos: ['GV_HA_FACIL_NK', 'GV_HA_FACIL_SN'],
  },
];


