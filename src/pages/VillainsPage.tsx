import { useSearchParams } from 'react-router';
import { publishedSagas, SAGAS_BY_ID } from '../data/sagas.ts';
import { byPower, characters, countBy, factions, findFaction } from '../data/characters/index.ts';
import { factionImage } from '../lib/images.ts';
import { CharacterGrid } from '../components/character/CharacterGrid.tsx';
import { FilterChips } from '../components/filters/FilterChips.tsx';
import styles from './VillainsPage.module.css';

const publishedIds = new Set(publishedSagas.map((s) => s.id));

export function VillainsPage() {
  const [params] = useSearchParams();
  const sagaParam = params.get('saga');
  const saga = publishedSagas.find((s) => s.id === sagaParam)?.id;
  const faction = findFaction(params.get('faccion'));

  // Solo sagas publicadas: Z existe en los datos pero aún no se muestra.
  const villains = characters.filter((c) => c.role === 'villain' && publishedIds.has(c.saga)).sort(byPower);
  // Los contadores de cada filtro respetan el OTRO filtro activo, para que nunca prometan algo vacío.
  const inFaction = faction ? villains.filter((c) => c.faction === faction.id) : villains;
  const inSaga = saga ? villains.filter((c) => c.saga === saga) : villains;
  const visible = inSaga.filter((c) => !faction || c.faction === faction.id);
  const sagaCounts = countBy(inFaction, (c) => c.saga);
  const factionCounts = countBy(inSaga, (c) => c.faction);

  return (
    <article>
      <header className={styles.header}>
        <p className={styles.kicker}>Catálogo</p>
        <h1 className={styles.title}>Villanos</h1>
        <p className={styles.lead}>
          Todos los antagonistas de las sagas publicadas, ordenados por nivel de poder. Cada ficha conserva el color de su saga.
        </p>
      </header>

      <div className={styles.filters}>
        <FilterChips
          label="Saga"
          param="saga"
          allLabel="Todas"
          total={inFaction.length}
          options={publishedSagas.map((s) => ({ value: s.id, label: s.short, count: sagaCounts[s.id] ?? 0 }))}
        />
        <FilterChips
          label="Facción"
          param="faccion"
          allLabel="Todas"
          total={inSaga.length}
          options={factions.map((f) => ({ value: f.id, label: f.name, count: factionCounts[f.id] ?? 0 }))}
        />
      </div>

      {faction && (
        <aside className={styles.faction} aria-label={`Facción ${faction.name}`}>
          {faction.image && <img src={factionImage(faction.id)} alt="" loading="lazy" width={640} height={360} />}
          <div>
            <p className={styles.kicker}>Facción · {faction.sagas.filter((s) => publishedIds.has(s)).map((s) => SAGAS_BY_ID[s].name).join(', ')}</p>
            <h2 className={styles.factionName}>{faction.name}</h2>
            <p className={styles.factionText}>{faction.description}</p>
          </div>
        </aside>
      )}

      <p className={styles.counter} aria-live="polite">Mostrando {visible.length} de {villains.length} villanos</p>
      <CharacterGrid characters={visible} showSaga />
    </article>
  );
}
