import type { SagaId } from '../types/character.ts';

export interface SagaInfo {
  id: SagaId;
  name: string;
  /** Nombre corto para la navegación. */
  short: string;
  tagline: string;
  cover?: string;
  /** false = la saga existe en los datos pero aún no se publica (ruta y navegación la ocultan). */
  enabled: boolean;
}

// Agregar o publicar una saga = editar este registro. Ningún componente lista sagas a mano.
export const SAGA_LIST: readonly SagaInfo[] = [
  { id: 'dragon-ball', name: 'Dragon Ball', short: 'Dragon Ball', tagline: 'La aventura original: esferas, torneos y la Patrulla Roja.', cover: '/images/port/characts.dragon-ball-640.webp', enabled: true },
  { id: 'z', name: 'Dragon Ball Z', short: 'Z', tagline: 'Saiyajins, Freezer y Cell: la era de las transformaciones.', enabled: false },
  { id: 'gt', name: 'Dragon Ball GT', short: 'GT', tagline: 'Las Esferas Oscuras y el Super Saiyajin 4.', cover: '/images/port/characts.dball-gt-640.webp', enabled: true },
  { id: 'super', name: 'Dragon Ball Super', short: 'Super', tagline: 'Dioses, ángeles y el Torneo del Poder.', cover: '/images/port/characts.dragon.ball-super-640.webp', enabled: true },
];
    
export const SAGAS_BY_ID = Object.fromEntries(SAGA_LIST.map((s) => [s.id, s])) as Record<SagaId, SagaInfo>;
export const publishedSagas = SAGA_LIST.filter((s) => s.enabled);

export const findSaga = (id: string | undefined): SagaInfo | undefined =>
  SAGA_LIST.find((s) => s.id === id);
