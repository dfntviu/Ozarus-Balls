// Contrato de datos de Ozarus & Balls.
// Claves en inglés; contenido en español.
// Los valores permitidos se definen UNA vez como arrays `as const`: de ellos salen los tipos
// (para el compilador) y la validación en tiempo de ejecución (scripts/normalize-saga.ts).

export const SAGAS = ['dragon-ball', 'z', 'gt', 'super'] as const;
export type SagaId = (typeof SAGAS)[number];

/** Rol dentro de UNA aparición (un mismo personaje puede cambiar de rol entre arcos). */
export const ROLES = ['hero', 'villain', 'support'] as const;
export type Role = (typeof ROLES)[number];

export const RACE_LABEL = {
  saiyan: 'Saiyajin',
  'half-saiyan': 'Híbrido humano-Saiyajin',
  human: 'Humano',
  namekian: 'Namekiano',
  'frieza-race': 'Raza de Freezer',
  alien: 'Extraterrestre',
  android: 'Androide',
  'bio-android': 'Bioandroide',
  cyborg: 'Humano modificado',
  kaio: 'Deidad Kaio',
  god: 'Dios de la destrucción / deidad',
  angel: 'Ángel',
  demon: 'Demonio',
  dragon: 'Dragón',
  anthropomorphic: 'Animal antropomorfo',
  monster: 'Monstruo',
  'artificial-creature': 'Criatura artificial',
} as const;
export type Race = keyof typeof RACE_LABEL;
export const RACES = Object.keys(RACE_LABEL) as Race[];

/** 1–5: poder relativo DENTRO del arco (o de la saga si no tiene arcos). */
export const TIERS = [1, 2, 3, 4, 5] as const;
export type Tier = (typeof TIERS)[number];

export const IMPACTS = ['low', 'mid', 'high', 'max'] as const;
export type Impact = (typeof IMPACTS)[number];

export interface PowerLevel {
  /** Cifra numérica, solo si la fuente la trae (oficial o estimada). */
  value?: number;
  /** Texto original que se muestra en la UI. */
  label: string;
  /** false para estimados, aproximados, referenciales y "No oficial". */
  official: boolean;
}

export interface Technique {
  name: string;
  description: string;
  /** Ausente en técnicas de apoyo/utilidad o cuando la fuente no lo indica. */
  impact?: Impact;
}

export interface Weakness {
  name: string;
  description: string;
}

/** Organización a la que pertenecen varios personajes (p. ej. Red Ribbon). No es un personaje. */
export interface Faction {
  id: string;
  name: string;
  description: string;
  image?: string;
  sagas: SagaId[];
}

export interface Character {
  /** slug(nombre)-saga[-arco]: único por aparición. */
  id: string;
  name: string;
  saga: SagaId;
  /** Opcional: Dragon Ball clásico, GT y Super (por ahora) no se dividen en arcos. */
  arc?: string;
  role: Role;
  race: Race;
  tier: Tier;
  /** id de una Faction (src/data/factions.json). */
  faction?: string;
  /** Solo cuando la fuente trae nivel de poder (hoy: saga Z). */
  power?: PowerLevel;
  signatureTechnique?: string;
  description: string;
  transformations?: string[];
  purpose?: string;
  /** Ruta relativa a la carpeta de imágenes. */
  image?: string;
  techniques?: Technique[];
  weaknesses?: Weakness[];
}
