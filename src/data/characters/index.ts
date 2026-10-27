// Punto único de acceso a los personajes: la app importa de aquí, nunca los JSON directamente.
import type { Character, Faction, Race, Role, SagaId, Tier } from '../../types/character.ts';
import dragonBall from './dragon-ball.json' with { type: 'json' };
import z from './z.json' with { type: 'json' };
import gt from './gt.json' with { type: 'json' };
import superSaga from './super.json' with { type: 'json' };
import factionData from '../factions.json' with { type: 'json' };

// TypeScript ensancha los literales de un JSON importado ('z' -> string), así que aquí se valida
// la FORMA completa (campos, opcionales, anidados). Los valores de los enums (saga, rol, raza,
// tier, impacto, facción) los garantiza scripts/normalize-saga.ts, que no escribe un JSON inválido.
type Widen<T> = T extends string ? string : T extends number ? number
  : T extends (infer U)[] ? Widen<U>[] : T extends object ? { [K in keyof T]: Widen<T[K]> } : T;

const checked: Widen<Character>[] = [...dragonBall, ...z, ...gt, ...superSaga];
const checkedFactions: Widen<Faction>[] = factionData;

export const characters = checked as Character[];
export const factions = checkedFactions as Faction[];

// ---------- Selectores puros: la lógica de filtrado vive aquí, no en los componentes ----------

export const bySaga = (saga: SagaId) => characters.filter((c) => c.saga === saga);
export const byRole = (role: Role, list = characters) => list.filter((c) => c.role === role);
export const byFaction = (factionId: string) => characters.filter((c) => c.faction === factionId);

// Se anaden 2 variables para los filtros
 export const findFaction = (id: string| null| undefined) => factions.find((f)=> f.id ===id); 
 export const factionName = (id: string) => findFaction(id)?.name ?? id;
 
 export const byPower = (a: Character, b: Character) =>
     b.tier - a.tier || (b.power?.value ?? 0) || (a.power?.value ?? 0) || a.name.localeCompare(b.name, 'es')

 export const countBy = <K extends string>(list: Character[], key: (c: Character) => K | undefined) =>
    list.reduce<Partial<Record<K,number>>>((acc, c) => {
      const k = key(c);
      if(k!==undefined) acc[k] =(acc[k] ?? 0) + 1;
      return acc;
    }, {});

/** Razas que se presentan como categoría propia en los destacados, no como guerreros. */
const DEITY_RACES: readonly Race[] = ['god'];
const ANGEL_RACES: readonly Race[] = ['angel'];

export interface FeaturedGroups {
  /** Combatientes de tier alto (héroes, villanos y apoyo que no son deidades). */
  warriors: Character[];
  /** Deidades: dioses de la destrucción, Zeno-sama… */
  deities: Character[];
  /** Ángeles (hoy solo existen en Super). */
  angels: Character[];
}

/**
 * Destacados de una saga (o de un arco) = tier >= minTier, agrupados por categoría.
 * Es un valor DERIVADO: se calcula a partir de tier + race, no se guarda en el personaje,
 * para que no existan dos fuentes de verdad que se puedan contradecir.
 */
export function featured(saga: SagaId, { arc, minTier = 5 }: { arc?: string; minTier?: Tier } = {}): FeaturedGroups {
  const top = bySaga(saga)
    .filter((c) => (arc === undefined || c.arc === arc) && c.tier >= minTier)
    .sort((a, b) => b.tier - a.tier || (b.power?.value ?? 0) - (a.power?.value ?? 0));
  const groups: FeaturedGroups = { warriors: [], deities: [], angels: [] };
  for (const c of top) {
    if (DEITY_RACES.includes(c.race)) groups.deities.push(c);
    else if (ANGEL_RACES.includes(c.race)) groups.angels.push(c);
    else groups.warriors.push(c);
  }
  return groups;
}
