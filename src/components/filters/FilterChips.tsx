import { useSearchParams } from 'react-router';
import styles from './FilterChips.module.css';

export interface FilterOption {
  value: string;
  label: string;
  count: number;
}

interface Props {
  label: string;
  /** Nombre del parámetro en la URL (?rol=villain). */
  param: string;
  options: FilterOption[];
  allLabel?: string;
  total: number;
}

/**
 * El filtro vive en la URL, no en useState: el enlace se puede compartir, sobrevive a recargas
 * y el botón "atrás" deshace el último filtro. La página solo LEE el parámetro.
 */
export function FilterChips({ label, param, options, allLabel = 'Todos', total }: Props) {
  const [params, setParams] = useSearchParams();
  const current = params.get(param);

  const select = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(param);
    else next.set(param, value);
    setParams(next, { preventScrollReset: true });
  };

  return (
    <div className={styles.group} role="group" aria-label={label}>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.chip} aria-pressed={current === null} onClick={() => select(null)}>
        {allLabel} <span className={styles.count}>{total}</span>
      </button>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className={styles.chip}
          aria-pressed={current === o.value}
          disabled={o.count === 0}
          onClick={() => select(o.value)}
        >
          {o.label} <span className={styles.count}>{o.count}</span>
        </button>
      ))}
    </div>
  );
}
