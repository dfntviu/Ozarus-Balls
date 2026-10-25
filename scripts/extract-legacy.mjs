#!/usr/bin/env node
// Extrae personajes del sitio HTML original -> data-raw/<saga>.legacy.json
// Usa el DOM que construye el navegador (Chromium), es decir, exactamente lo que el usuario veía,
// incluso con HTML mal formado (<p> que contienen <h3> y <table>).
// Uso: node scripts/extract-legacy.mjs <ruta-al-sitio-original>

import { chromium } from 'playwright';
import { writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.argv[2];
if (!SITE) { console.error('Uso: node scripts/extract-legacy.mjs <ruta-al-sitio-original>'); process.exit(1); }

const PAGES = [
  { file: 'sagas/dgn.ball.html', saga: 'dragon-ball', start: '.section_sq h3' },
  { file: 'sagas/dgn.ball-gt.html', saga: 'gt', start: '.section_sq h3' },
  { file: 'sagas/dgn.ball-super.html', saga: 'super', start: '.section_sq h3' },
  // En Villanos la <img> va ANTES del <h2>: se agrupa por el contenedor completo, no por el título.
  { file: 'villanos/villanos.cat.html', saga: 'dragon-ball', start: 'div.image', title: 'h2.char-titulo', origin: 'villanos' },
];

// Nombre original -> nombre limpio (+ transformaciones que estaban escritas en el nombre).
// Cada corrección queda registrada en el campo `nombre_original` del registro.
const NAME_FIX = {
  'abuelo gohan': { nombre: 'Abuelo Gohan' },
  'oloog': { nombre: 'Oolong' },
  'kami.sama': { nombre: 'Kamisama' },
  'Mutten Roshi': { nombre: 'Maestro Roshi' },
  'Muten Roshi': { nombre: 'Maestro Roshi' },
  'jakie-chull': { nombre: 'Jackie Chun' },
  'Uranai-Baba': { nombre: 'Uranai Baba' },
  'Tenshinhan': { nombre: 'Ten Shin Han' },
  'ten-Sheen-Han': { nombre: 'Ten Shin Han' },
  'Mister. Poppo': { nombre: 'Mr. Popo' },
  'Chichi Kid': { nombre: 'Chi-Chi' },
  'milk': { nombre: 'Chi-Chi' },
  'Son Goku': { nombre: 'Goku' },
  'gohan Adulto': { nombre: 'Gohan' },
  'son gohan': { nombre: 'Gohan' },
  'Grl ryldo': { nombre: 'General Rildo' },
  'super 17': { nombre: 'Súper 17' },
  'Dragon 2 Estrellas': { nombre: 'Dragón de 2 Estrellas' },
  'una estrella': { nombre: 'Dragón de 1 Estrella' },
  'goku SSajin 04': { nombre: 'Goku', transformaciones: ['Super Saiyajin 4'] },
  'vegetta SSajin 04': { nombre: 'Vegeta', transformaciones: ['Super Saiyajin 4'] },
  'Cauifla': { nombre: 'Caulifla' },
  'Caile': { nombre: 'Kale' },
  'Kaba': { nombre: 'Cabba' },
  'dios de la destrucción Whis': { nombre: 'Whis' },
  'dios de la destrucción sidra': { nombre: 'Sidra' },
  'D. Destruccion liqueur': { nombre: 'Liqueur' },
  'bills': { nombre: 'Bills' },
  'champpa': { nombre: 'Champa' },
  'Bottamo': { nombre: 'Botamo' },
  'And Num 18': { nombre: 'Androide 18' },
  'Androide Número 17': { nombre: 'Androide 17' },
  'Golden Frieza[Freezer]': { nombre: 'Freezer', transformaciones: ['Golden Freezer'] },
  'son-goku-SSJ Blue': { nombre: 'Goku', transformaciones: ['Super Saiyajin Blue'] },
  'vegeta': { nombre: 'Vegeta', transformaciones: ['Super Saiyajin Blue'] },
  'Goku.Black.SSJ-Rose': { nombre: 'Goku Black', transformaciones: ['Super Saiyajin Rosé'] },
  'zamassu': { nombre: 'Zamasu' },
  'Zenosama': { nombre: 'Zeno-sama' },
  'ribianne': { nombre: 'Ribrianne' },
  'kafla': { nombre: 'Kefla' },
  'super-broly': { nombre: 'Broly' },
  'maggueta': { nombre: 'Magetta' },
  'saka-ku': { nombre: 'Sakaku' },
  'sishami': { nombre: 'Shisami' },
  'gotten': { nombre: 'Goten' },
  'bulma-actual': { nombre: 'Bulma' },
  'trunks del futuro': { nombre: 'Trunks del futuro' },
  // villanos
  'raditz': { nombre: 'Raditz' },
  'doctor guero': { nombre: 'Dr. Gero' },
  'Garlic Junior': { nombre: 'Garlic Jr.' },
  'tao-pai-pai': { nombre: 'Tao Pai Pai' },
  'Red Ribon': { nombre: 'Red Ribbon' },
  'Emperador Pillaf': { nombre: 'Emperador Pilaf' },
  'Maestro-Sheen': { nombre: 'Maestro Shen' },
  'Ninja Purpura': { nombre: 'Ninja Púrpura' },
  'May': { nombre: 'Mai' },
  'coronel silver': { nombre: 'Coronel Silver' },
  'Adroide 8': { nombre: 'Androide 8' },
  'Reptil Giran': { nombre: 'Giran' },
};

// Villanos que no van a Dragon Ball clásico: se fusionan con un registro existente o se reubican.
const VILLAIN_ROUTE = {
  'Raditz': { saga: 'z', fusionar_con: 'raditz-z-saiyajins' },
  'Dr. Gero': { saga: 'z', fusionar_con: 'dr-gero-androide-20-z-cell' },
  'Garlic Jr.': { saga: 'z', arco: 'garlic-jr' },
};

const titleCase = (s) => s.replace(/[-.]+/g, ' ').replace(/\s+/g, ' ').trim()
  .replace(/(^|\s)(\p{L})/gu, (m, sp, ch) => sp + ch.toUpperCase());
const clean = (s) => s.replace(/\s+/g, ' ').replace(/^["“\s]+|["”\s]+$/g, '').trim();
const capFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// El sitio original corría en Windows (rutas sin distinguir mayúsculas). En un hosting Linux
// "goku.Ss4.jpg" != "Goku.Ss4.jpg" y la imagen da 404: se resuelve contra el nombre real en disco.
const IMAGES = join(SITE, 'assets/images');
function resolveImage(rel) {
  if (!rel) return { path: null, note: 'sin imagen' };
  if (existsSync(join(IMAGES, rel))) return { path: rel };
  const [dir, file] = [dirname(rel), rel.split('/').pop()];
  const real = existsSync(join(IMAGES, dir)) && readdirSync(join(IMAGES, dir)).find((f) => f.toLowerCase() === file.toLowerCase());
  return real ? { path: `${dir}/${real}`, note: `ruta de imagen corregida (mayúsculas): ${rel}` } : { path: rel, note: `imagen no encontrada: ${rel}` };
}

const browser = await chromium.launch();
const page = await browser.newPage();
await page.route('**/*', (r) => (['image', 'script', 'stylesheet'].includes(r.request().resourceType()) ? r.abort() : r.continue()));

const bySaga = {};
for (const def of PAGES) {
  await page.goto(pathToFileURL(join(SITE, def.file)).href);
  // Linealiza el DOM en orden de documento: títulos, texto, imágenes, tablas, <hr>.
  const tokens = await page.evaluate(([startSel, titleSel]) => {
    const starts = new Set(document.querySelectorAll(startSel));
    const root = [...starts][0]?.closest('.section_sq, .cleancont') ?? document.body;
    const out = [];
    const walk = (node) => {
      for (const n of node.childNodes) {
        if (n.nodeType === 3) { const t = n.textContent.replace(/\s+/g, ' ').trim(); if (t) out.push({ k: 'text', t }); continue; }
        if (n.nodeType !== 1) continue;
        const tag = n.tagName;
        if (starts.has(n)) {
          if (!titleSel) { out.push({ k: 'start', t: n.textContent.trim() }); continue; }
          out.push({ k: 'start', t: n.querySelector(titleSel).textContent.trim() });
          walk(n); // recorre el contenido del contenedor (img, p, table); el <h2> se omite abajo
          continue;
        }
        if (tag === 'IMG') { out.push({ k: 'img', src: n.getAttribute('src') }); continue; }
        if (tag === 'HR') { out.push({ k: 'hr' }); continue; }
        if (tag === 'BUTTON' || tag === 'SCRIPT' || tag === 'H2' || tag === 'H3') continue;
        if (tag === 'TABLE') {
          const heads = [...n.querySelectorAll('th')].map((x) => x.textContent.trim());
          const rows = [...n.querySelectorAll('tr')].map((r) => [...r.querySelectorAll('td')].map((c) => c.textContent.replace(/\s+/g, ' ').trim()))
            .filter((r) => r.length && r.some(Boolean));
          out.push({ k: 'table', heads, rows });
          continue;
        }
        walk(n);
      }
    };
    walk(root);
    return out;
  }, [def.start, def.title]);

  // Agrupa tokens por personaje. En GT las líneas "Técnica Propia: ..." aparecen ANTES del
  // personaje al que pertenecen (tras un <hr>), por eso se guardan como pendientes.
  let current = null;
  let pending = [];
  const chars = [];
  for (const tk of tokens) {
    if (tk.k === 'text' && /^(T[ée]cnica|Poder)\s*:?\s*(unidades)?$/i.test(tk.t)) continue; // plantilla vacía sin comentar
    if (tk.k === 'start') {
      current = { nombre_original: tk.t, texto: [], imagen: null, tablas: [], notas: [...pending] };
      pending = [];
      chars.push(current);
    } else if (tk.k === 'text' && /^(T[ée]cnicas?( Propias?)?\s*[-:]|Creadores:)/i.test(tk.t)) {
      pending.push(tk.t);
    } else if (!current) {
      continue;
    } else if (tk.k === 'text') current.texto.push(tk.t);
    else if (tk.k === 'img' && !current.imagen) current.imagen = tk.src;
    else if (tk.k === 'table') current.tablas.push(tk);
  }

  for (const c of chars) {
    const fix = NAME_FIX[c.nombre_original] ?? { nombre: titleCase(c.nombre_original) };
    const tecnicas = [];
    const debilidades = [];
    for (const t of c.tablas) {
      let heads = t.heads.filter(Boolean);
      let rows = t.rows;
      if (!heads.length && rows[0] && /nombre|t[ée]cnica/i.test(rows[0][0])) { heads = rows[0]; rows = rows.slice(1); }
      if (!rows.length) continue; // tabla vacía (p. ej. Toppo)
      const isWeak = /debs|debilidad/i.test(heads[0] ?? '');
      for (const r of rows) {
        const item = { nombre: clean(r[0] ?? ''), descripcion: capFirst(clean(r[1] ?? '')) };
        if (!item.nombre) continue;
        if (isWeak) debilidades.push(item);
        else tecnicas.push(r[2] ? { ...item, impacto: clean(r[2]) } : item);
      }
    }
    // GT: "Técnica Propia: A, B | C" -> técnicas sin descripción
    const notas = [];
    for (const n of c.notas) {
      const m = n.match(/^T[ée]cnicas?(?: Propias?)?\s*[-:]\s*(.+)$/i);
      if (m) m[1].split(/[,|]/).map(clean).filter(Boolean).forEach((nombre) => tecnicas.push({ nombre: capFirst(nombre), descripcion: '' }));
      else notas.push(clean(n));
    }

    const img = resolveImage(c.imagen?.replace(/^(\.\.\/)*assets\/images\//, ''));
    if (img.note) notas.push(img.note);
    const route = def.origin === 'villanos' ? VILLAIN_ROUTE[fix.nombre] : undefined;
    const saga = route?.saga ?? def.saga;
    const rec = {
      nombre: fix.nombre,
      nombre_original: c.nombre_original,
      ...(route?.arco && { arco: route.arco }),
      ...(route?.fusionar_con && { fusionar_con: route.fusionar_con }),
      origen: def.origin ?? 'sagas',
      descripcion: capFirst(clean(c.texto.join(' '))),
      imagen: img.path,
      ...(fix.transformaciones && { transformaciones: fix.transformaciones }),
      ...(tecnicas.length && { tecnicas }),
      ...(debilidades.length && { debilidades }),
      ...(notas.length && { notas }),
    };
    (bySaga[saga] ??= []).push(rec);
  }
}
await browser.close();

for (const [saga, list] of Object.entries(bySaga)) {
  const path = `data-raw/${saga}.legacy.json`;
  writeFileSync(join(ROOT, path), JSON.stringify(list, null, 2) + '\n');
  console.log(`${path}: ${list.length} registros`);
}
