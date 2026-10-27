import type { Character } from '../../types/character.ts';
import { SAGAS_BY_ID } from '../../data/sagas.ts';
import { CharacterCard } from './CharacterCard.tsx';
import styles from './CharacterGrid.module.css';

export function CharacterGrid({ characters, showSaga = false }: { characters: Character[]; showSaga?: boolean }) {
  if (!characters.length) {
    return <p className={styles.empty}>Ningún personaje coincide con este filtro.</p>;
  }
  return (
    <ul className={styles.grid}>
      {characters.map((c) => (
        <li key={c.id}>
          <CharacterCard character={c} {...(showSaga && { showSaga: SAGAS_BY_ID[c.saga].name })} />
        </li>
      ))}
    </ul>
  );
}
