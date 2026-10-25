import { useTheme } from '../theme/useTheme.ts';
import { THEMES, THEME_IDS } from '../theme/themes.ts';
import styles from './ThemeSwitcher.module.css';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  return (
    <div className={styles.switcher} role="radiogroup" aria-label="Tema de color">
      {THEME_IDS.map((id) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={theme === id}
          className={styles.option}
          data-swatch={id}
          onClick={() => setTheme(id)}
        >
          <span className={styles.dot} aria-hidden="true" />
          {THEMES[id].label}
        </button>
      ))}
    </div>
  );
}
