import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { readStorage, writeStorage } from '../lib/safeStorage.ts';
import { STORAGE_KEY, THEMES, isThemeId, type ThemeId } from './themes.ts';

export interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Estado inicial = lo que ya aplicó el script de index.html en <html data-theme>.
 * Así React arranca con el mismo tema que el usuario ya está viendo (sin parpadeo).
 */
function initialTheme(): ThemeId {
  const fromDom = document.documentElement.dataset.theme;
  if (isThemeId(fromDom)) return fromDom;
  const stored = readStorage(STORAGE_KEY);
  return isThemeId(stored) ? stored : 'orange';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(initialTheme);

  // Efecto = sincronizar React con sistemas externos: el atributo del DOM y la barra del navegador.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEMES[theme].themeColor);
  }, [theme]);

  // Solo se persiste lo que el usuario ELIGE: si nunca elige, se sigue respetando su preferencia del sistema.
  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    writeStorage(STORAGE_KEY, next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
