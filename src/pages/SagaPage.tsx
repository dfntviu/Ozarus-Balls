import { useParams } from 'react-router';
import { findSaga } from '../data/sagas.ts';
import { bySaga, byRole, featured } from '../data/characters/index.ts';
import { NotFoundPage } from './NotFoundPage.tsx';
import styles from './SagaPage.module.css';

// F3: la página demuestra el sistema (acento de saga + datos). La plantilla de fichas llega en F4.
export function SagaPage() {
  const { sagaId } = useParams();
  const saga = findSaga(sagaId);
  if (!saga || !saga.enabled) return <NotFoundPage />;

  // Cálculos baratos (≈50 elementos): sin useMemo. Memorizar aquí costaría más de lo que ahorra.
  const all = bySaga(saga.id);
  const { warriors, deities, angels } = featured(saga.id);
  const groups = [
    { title: 'Guerreros destacados', list: warriors },
    { title: 'Deidades', list: deities },
    { title: 'Ángeles', list: angels },
  ].filter((g) => g.list.length);

  return (
    <article data-saga={saga.id}>
      <header className={styles.band}>
        <p className={styles.kicker}>Saga</p>
        <h1 className={styles.title}>{saga.name}</h1>
        <p className={styles.tagline}>{saga.tagline}</p>
        <dl className={styles.stats}>
          <div><dt>Personajes</dt><dd>{all.length}</dd></div>
          <div><dt>Héroes</dt><dd>{byRole('hero', all).length}</dd></div>
          <div><dt>Villanos</dt><dd>{byRole('villain', all).length}</dd></div>
        </dl>
      </header>

      {groups.map((g) => (
        <section key={g.title} className={styles.group} aria-label={g.title}>
          <h2 className={styles.groupTitle}>{g.title}</h2>
          <ul className={styles.chips}>
            {g.list.map((c) => (
              <li key={c.id} className={styles.chip}>
                {c.name}
                {c.transformations?.[0] && <span className={styles.form}>{c.transformations[0]}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </article>
  );
}
