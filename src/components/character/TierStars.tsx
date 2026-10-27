import { TIERS, type Tier } from '../../types/character.ts';
import styles from './TierStars.module.css';

// El tier se dibuja como estrellas de esfera del dragón: 1 a 5.
export function TierStars({ tier, className = '' }: { tier: Tier; className?: string }) {
  return (
    <span className={`${styles.stars} ${className}`} role="img" aria-label={`Nivel de poder ${tier} de 5`}>
      {TIERS.map((t) => (
        <span key={t} className={t <= tier ? styles.on : styles.off} aria-hidden="true">★</span>
      ))}
    </span>
  );
}
