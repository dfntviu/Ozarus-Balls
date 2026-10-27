#!/usr/bin/env node
// Valida el contraste WCAG 2.1 de los pares texto/fondo declarados en los tokens.
// Lee los hex directamente de src/theme/tokens.css y src/theme/sagas.css (fuente única de verdad).
// Uso: npm run check:contrast   — sale con código 1 si algún par no cumple.

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const THEMES = ['orange', 'crimson'] as const;
const SAGAS = ['dragon-ball', 'z', 'gt', 'super'] as const;

type Vars = Record<string, string>;

/** Extrae las variables con valor hex de cada bloque cuyo selector cumpla `match`. */
function collect(css: string, match: (selector: string) => boolean): Vars {
  const vars: Vars = {};
  for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selector || !body || !match(selector.replace(/\/\*[\s\S]*?\*\//g, '').trim())) continue;
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-f]{3,8})\b/gi)) vars[name!] = value!.toLowerCase();
  }
  return vars;
}

/**
 * PROPOSITO: Calcular la luminancia relativa de un color hexadecimal para determinar que tan
 * claro u obscuro es visualmente. Este valor puede utilizarse para mejorar el contranste y la
 * legibilidad del texto o de elementos visuales de una interfaz. No modifica el color,
 * ni genera nuevos colores.
 */

// PROCESO
  /**
   * 1.Elimina el simbolo y convierte el valor hexadecimal a un formato de 6 dígitos.
   * 2. Extrae los canales RGV, normaliza sus valores y aplica un atransformación gamma para obtener la luminancia relativa de cada canal.
   * 3. Combina los canales mediante pesos especificos para obtener la luminancia relativa final. (0.2126 para R, 0.7152 para G y 0.0722 para B) 
   *  ==>  devuelve un unico valor de luminancia relativa entre 0 y 1.
   */
function luminance(hex: string) {  //#F => FF; 8 => 88;  0 => 00
  const h = hex.replace('#', '');  //F80  FF|88|00
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6); // FF8800
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}


 /**
  *  Calcula la relación de contraste entre dos colores.
  * @param a - El color del texto.
  * @param b - El color del fondo.
  * @returns La relación de contraste.
  */
 /**
  * 0.05: Es una constante que se suma a ambas luminancias para evitar valores
  * cercanos a cero, produzcan relación de contraste extremos.
  * 
  * Produciente el resultado. Para, calcular la relación de contraste entre dos colores para evaluar 
  * su adecuación a los criterios de legibilidad y accesibilidad visual
  */
const ratio = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
};

const tokens = readFileSync(join(ROOT, 'src/theme/tokens.css'), 'utf8');
const sagas = readFileSync(join(ROOT, 'src/theme/sagas.css'), 'utf8');

// [primer plano, fondo, mínimo, motivo]
const THEME_PAIRS: [string, string, number, string][] = [
  ['--color-text', '--color-bg', 4.5, 'texto'],
  ['--color-text', '--color-surface', 4.5, 'texto en tarjeta'],
  ['--color-text', '--color-surface-alt', 4.5, 'texto en panel alterno'],
  ['--color-text-muted', '--color-bg', 4.5, 'texto secundario'],
  ['--color-text-muted', '--color-surface', 4.5, 'texto secundario en tarjeta'],
  ['--color-primary-strong', '--color-bg', 4.5, 'enlaces'],
  ['--color-on-primary', '--color-primary', 4.5, 'botón primario'],
  ['--color-on-highlight', '--color-highlight', 4.5, 'insignia destacada'],
  ['--color-ink', '--color-bg', 3, 'bordes de tinta (no textual)'],
  ['--color-focus', '--color-bg', 3, 'anillo de foco (no textual)'],
];
const SAGA_PAIRS: [string, string, number, string][] = [
  ['--saga-on-accent', '--saga-accent', 4.5, 'texto sobre banda de saga'],
  ['--saga-accent-text', '--color-bg', 4.5, 'texto en color de saga'],
  ['--saga-accent-text', '--color-surface', 4.5, 'texto de saga en tarjeta'],
  ['--saga-accent', '--color-bg', 3, 'banda de saga vs fondo (no textual)'],
];

let failures = 0;
const rows: string[] = [];
for (const theme of THEMES) {
  const base = collect(tokens, (s) => s.split(',').some((p) => p.trim() === `:root[data-theme='${theme}']`));
  const check = (vars: Vars, [fg, bg, min, why]: [string, string, number, string], scope: string) => {
    const a = vars[fg], b = vars[bg];
    if (!a || !b) { failures++; rows.push(`✗ ${scope.padEnd(22)} falta ${!a ? fg : bg}`); return; }
    const r = ratio(a, b);
    const ok = r >= min;
    if (!ok) failures++;
    rows.push(`${ok ? '✓' : '✗'} ${scope.padEnd(22)} ${r.toFixed(2).padStart(5)} ≥ ${min}  ${why} (${a} / ${b})`);
  };
  for (const pair of THEME_PAIRS) check(base, pair, theme);
  for (const saga of SAGAS) {
    const own = collect(sagas, (s) => s.split(',').some((p) => p.trim() === `:root[data-theme='${theme}'] [data-saga='${saga}']`));
    for (const pair of SAGA_PAIRS) check({ ...base, ...own }, pair, `${theme} · ${saga}`);
  }
}

console.log(rows.join('\n'));
console.log(failures ? `\n${failures} par(es) no cumplen WCAG AA` : '\nTodos los pares cumplen WCAG AA');
process.exit(failures ? 1 : 0);
