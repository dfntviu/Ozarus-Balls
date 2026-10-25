import type { ReactNode } from 'react';
import styles from './PlaceholderPage.module.css';

export function PlaceholderPage({ title, phase, children }: { title: string; phase: string; children?: ReactNode }) {
  return (
    <section className={styles.panel}>
      <p className={styles.badge}>{phase}</p>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{children ?? 'Esta sección se construye en una fase posterior de la migración.'}</p>
    </section>
  );
}
