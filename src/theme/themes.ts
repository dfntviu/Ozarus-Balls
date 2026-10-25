// Debe coincidir con el script inline de index.html (clave, ids y color de theme-color).

export const STORAGE_KEY = 'ozarus:theme';

export const THEMES = {
  orange: { label: 'Amarillo-naranja', themeColor: '#fff4dc' },
  crimson: { label: 'Crimson', themeColor: '#1a0a0e' },
} as const;

export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && value in THEMES;
