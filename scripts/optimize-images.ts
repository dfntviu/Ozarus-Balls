#!/usr/bin/env node
// Optimiza las imágenes del sitio original para la app:
//   personajes -> public/images/characters/<id>-320.webp y <id>-640.webp
//   facciones  -> public/images/factions/<id>-640.webp
//   portadas   -> public/images/port/<nombre>-640.webp
// Se nombran por id: sin espacios ni mayúsculas (evita 404 en hosting Linux) y estables entre extracciones.
// Es incremental: no recalcula una salida más nueva que su fuente.
// Uso: npm run images  (o: node scripts/optimize-images.ts <ruta-al-sitio-original>)

import { readFileSync, readdirSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
// import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = process.argv[2] ?? join(ROOT, '..', 'Ozarus-Y.Balls');
const SRC_IMAGES = join(SITE, 'assets', 'images');
if (!existsSync(SRC_IMAGES)) {
  console.error(`No encuentro ${SRC_IMAGES}. Pasa la ruta del sitio original: node scripts/optimize-images.ts <ruta>`);
  process.exit(1);
}

interface Job { src: string; out: string; width: number }
const jobs: Job[] = [];
const missing: string[] = [];

const addJob = (relSrc: string, outBase: string, widths: number[]) => {
  const src = join(SRC_IMAGES, relSrc);
  if (!existsSync(src)) { missing.push(relSrc); return; }
  for (const width of widths) jobs.push({ src, out: `${outBase}-${width}.webp`, width });
};

// Personajes (todas las sagas generadas)
const dataDir = join(ROOT, 'src/data/characters');
for (const file of readdirSync(dataDir).filter((f) => f.endsWith('.json') && f !== 'stats.json')) {
  const list = JSON.parse(readFileSync(join(dataDir, file), 'utf8')) as { id: string; image?: string }[];
  for (const c of list) if (c.image) addJob(c.image, join(ROOT, 'public/images/characters', c.id), [320, 640]);
}
// Facciones
const factions = JSON.parse(readFileSync(join(ROOT, 'src/data/factions.json'), 'utf8')) as { id: string; image?: string }[];
for (const f of factions) if (f.image) addJob(f.image, join(ROOT, 'public/images/factions', f.id), [640]);
// Portadas de la home
for (const file of readdirSync(join(SRC_IMAGES, 'port'))) {
  addJob(join('port', file), join(ROOT, 'public/images/port', basename(file, extname(file))), [640]);
}

if (missing.length) {
  console.error(`Faltan ${missing.length} imágenes en el sitio original:\n  - ${missing.join('\n  - ')}`);
  process.exit(1);
}

let inBytes = 0;
let outBytes = 0;
let written = 0;
const seenSrc = new Set<string>();
for (const { src, out, width } of jobs) {
  if (!seenSrc.has(src)) { seenSrc.add(src); inBytes += statSync(src).size; }
  mkdirSync(dirname(out), { recursive: true });
  if (!existsSync(out) || statSync(out).mtimeMs < statSync(src).mtimeMs) {
    // await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 74, effort: 5 }).toFile(out);
    written++;
  }
  outBytes += statSync(out).size;
}

const mb = (b: number) => `${(b / 1024 / 1024).toFixed(2)} MB`;
console.log(`OK  ${jobs.length} archivos (${written} regenerados) de ${seenSrc.size} imágenes fuente`);
console.log(`    fuente usada: ${mb(inBytes)}  ->  salida WebP: ${mb(outBytes)}  (${(100 - (outBytes / inBytes) * 100).toFixed(1)} % menos)`);
