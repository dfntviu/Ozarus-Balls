import { IMPACT_LABEL, type Technique, type Weakness } from '../../types/character.ts';
import styles from './TechniqueList.module.css';

interface Props {
  title: string;
  items: (Technique | Weakness)[];
  weakness?: boolean;
}

// Lista estructurada en lugar de <table>: dentro de una tarjeta de ~300px una tabla de 3 columnas
// es ilegible en móvil. El impacto se destaca con una insignia de color por nivel.
export function TechniqueList({ title, items, weakness = false }: Props) {
  return (
    <section className={styles.block} aria-label={title}>
      <h4 className={styles.title} data-weakness={weakness}>{title}</h4>
      <ul className={styles.list}>
        {items.map((t) => {
          const impact = 'impact' in t ? t.impact : undefined;
          return (
            <li key={t.name} className={styles.item}>
              <div className={styles.head}>
                <span className={styles.name}>{t.name}</span>
                {!weakness && (
                  <span className={styles.impact} data-impact={impact ?? 'utility'}>
                    {impact ? IMPACT_LABEL[impact] : 'Utilidad'}
                  </span>
                )}
              </div>
              {t.description && <p className={styles.description}>{t.description}</p>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
