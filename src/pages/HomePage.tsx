import type { CSSProperties } from 'react';
import { Link } from 'react-router';
import { SAGA_LIST } from '../data/sagas.ts';
import { bySaga } from '../data/characters/index.ts';
import styles from './HomePage.module.css';

export function HomePage() {
  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-title">
        <p className={styles.kicker}>Catálogo fan · Universo Dragon Ball</p>
        <h1 id="hero-title" className={styles.title}>
          Esferas del Dragón <span className={styles.amp}>&amp;</span> Ozarus
        </h1>
        <p className={styles.lead}>
          Una fuente de consulta de los personajes de cada saga, con su poder, técnicas y transformaciones.
          Y para pasar un buen rato con tus amigos: trivia y sopa de letras.
        </p>
        <div className={styles.actions}>
          <Link to="/sagas/dragon-ball" className={styles.cta}>Explorar sagas</Link>
          <Link to="/juegos" className={styles.ctaGhost}>Jugar trivia</Link>
        </div>
      </section>

      <section aria-labelledby="sagas-title" className={styles.sagas}>
        <h2 id="sagas-title" className={styles.sectionTitle}>Sagas</h2>
        <ul className={styles.grid}>
          {SAGA_LIST.map((saga, i) => {
            const count = bySaga(saga.id).length;
            const body = (
              <>
                <div className={styles.cover}>
                  {saga.cover ? (
                    <img src={saga.cover} alt="" loading="lazy" width={640} height={360} />
                  ) : (
                    <span className={styles.soon} aria-hidden="true">Z</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{saga.name}</h3>
                  <p className={styles.tagline}>{saga.tagline}</p>
                  <p className={styles.meta}>
                    {saga.enabled ? `${count} personajes` : 'Próximamente'}
                  </p>
                </div>
              </>
            );
            return (
              <li key={saga.id} data-saga={saga.id} className={styles.card} style={{ '--i': i } as CSSProperties}>
                {saga.enabled ? (
                  <Link to={`/sagas/${saga.id}`} className={styles.cardLink}>{body}</Link>
                ) : (
                  <div className={styles.cardLink} aria-disabled="true">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
