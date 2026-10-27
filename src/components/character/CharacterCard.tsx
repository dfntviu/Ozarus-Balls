import { RACE_LABEL, ROLE_LABEL, type Character } from '../../types/character.ts';
import { characterImage } from '../../lib/image.ts';
import { factionName } from '../../data/characters/index.ts';
import { TierStars } from './TierStars.tsx';
import { TechniqueList } from './TechniqueList.tsx';
import styles from './CharacterCard.module.css';

interface Props {
  character: Character;
  /** Muestra la saga en la cabecera (útil en listados que mezclan sagas, como Villanos). */
  showSaga?: string;
}

// Vista pura: recibe un personaje y lo pinta. Sin estado ni reglas de negocio.
export function CharacterCard({ character: c, showSaga }: Props) {
  const img = characterImage(c);
  const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;
  const detailParts = [
    c.techniques?.length && plural(c.techniques.length, 'técnica', 'técnicas'),
    c.weaknesses?.length && plural(c.weaknesses.length, 'debilidad', 'debilidades'),
  ].filter(Boolean);
  const meta = [RACE_LABEL[c.race], c.arc && `arco ${c.arc}`, c.faction && factionName(c.faction), showSaga].filter(Boolean);

  return (
    <article id={c.id} className={styles.card} data-saga={c.saga} data-role={c.role}>
      <div className={styles.media}>
        {img ? (
          <img src={img.src} srcSet={img.srcSet} sizes="(min-width: 60rem) 300px, 90vw" alt="" loading="lazy" decoding="async" />
        ) : (
          <span className={styles.initials} aria-hidden="true">{c.name.slice(0, 2)}</span>
        )}
        <span className={styles.role}>{ROLE_LABEL[c.role]}</span>
        <TierStars tier={c.tier} className={styles.tier} />
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{c.name}</h3>
        <p className={styles.meta}>{meta.join(' · ')}</p>

        {c.power && (
          <p className={styles.power}>
            <span className={styles.powerLabel}>Poder</span>
            <span className={styles.powerValue}>{c.power.label}</span>
            {!c.power.official && <span className={styles.unofficial}>no oficial</span>}
          </p>
        )}

        {c.transformations && (
          <ul className={styles.forms} aria-label="Transformaciones">
            {c.transformations.map((t) => <li key={t}>{t}</li>)}
          </ul>
        )}

        {c.signatureTechnique && (
          <p className={styles.signature}>
            <span>Técnica insignia</span> {c.signatureTechnique}
          </p>
        )}

        <p className={styles.description}>{c.description}</p>

        <details className={styles.details}>
          <summary>{detailParts.length ? `Ficha completa · ${detailParts.join(' · ')}` : 'Leer descripción completa'}</summary>
          {c.techniques && <TechniqueList title="Técnicas" items={c.techniques} />}
          {c.weaknesses && <TechniqueList title="Debilidades" items={c.weaknesses} weakness />}
        </details>
      </div>
    </article>
  );
}
