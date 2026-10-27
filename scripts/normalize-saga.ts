#!/usr/bin/env node
// Normaliza una saga a partir de hasta tres capas:
//   data-raw/<saga>.source.json    datos que escribiste a mano (formato por arcos, opcional)
//   data-raw/<saga>.legacy.json    extraído del sitio HTML original (opcional)
//   data-raw/<saga>.editorial.json tus decisiones: rol, raza, tier, nombre, propósito… (obligatoria)
// Salida: src/data/characters/<saga>.json + data-raw/<saga>.review.md
// Uso: node scripts/normalize-saga.ts <saga>   (Node >= 22.18 ejecuta TypeScript sin compilar)
// Falla con código 1 si algo no valida: nunca escribe un JSON inválido.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SAGAS, ROLES, RACES, TIERS } from '../src/types/character.ts';
import type { Character, Impact, PowerLevel, Race, Role, SagaId, Technique, Tier, Weakness } from '../src/types/character.ts';

// ---------- Formatos de entrada ----------

interface SourceEntry { nombre: string; nivel_poder: string; mejor_tecnica: string; origen_raza: string; descripcion: string }
interface SourceFile { sagas: Record<string, SourceEntry[]> }

interface LegacyEntry {
  nombre: string;
  nombre_original: string;
  arco?: string;
  fusionar_con?: string;
  origen: 'sagas' | 'villanos';
  descripcion: string;
  imagen: string | null;
  transformaciones?: string[];
  /** Añadido a mano: número (p. ej. 950000000) o texto como en la fuente ("No oficial (estimado: 40000+)"). */
  nivel_poder?: number | string;
  tecnicas?: { nombre: string; descripcion: string; impacto?: string }[];
  debilidades?: { nombre: string; descripcion: string }[];
  notas?: string[];
}

interface EditorialEntry {
  /** Excluye el registro de la salida (motivo obligatorio, queda en la revisión). */
  skip?: string;
  role: Role;
  faction?: string;
  /** Corrige técnicas por su nombre original: { "Forma Maxima": { "name": "Max Power" } }. */
  techniqueFixes?: Record<string, Partial<Technique>>;
  race?: Race;
  tier?: Tier;
  name?: string;
  signatureTechnique?: string;
  transformations?: string[];
  purpose?: string;
  note?: string;
}

// ---------- Reglas de normalización ----------

const RACE_MAP: Record<string, Race> = {
  'Saiyajin': 'saiyan',
  'Híbrido humano-Saiyajin': 'half-saiyan',
  'Humano': 'human',
  'Humana': 'human',
  'Namekiano': 'namekian',
  'Raza de Freezer (sin nombre oficial)': 'frieza-race',
  'Extraterrestre': 'alien',
  'Extraterrestre transformable': 'alien',
  'Androide completamente artificial': 'android',
  'Androide artificial': 'android',
  'Bioandroide': 'bio-android',
  'Humano modificado': 'cyborg',
  'Humana modificada': 'cyborg',
  'Humano convertido en androide': 'cyborg',
  'Deidad Kaio': 'kaio',
  'Criatura vegetal artificial': 'artificial-creature',
};
const NOT_OFFICIAL = /estimado|no oficial|aproximado|referencial/i;

const TRANSFORMATION_RULES: [RegExp, (m: RegExpMatchArray) => string][] = [
  [/Kaioken x(\d+)/i, (m) => `Kaioken x${m[1]}`],
  [/Super Saiyajin de (segundo|tercer) grado/i, (m) => `Super Saiyajin de ${m[1]} grado`],
  [/Super Saiyajin 2/i, () => 'Super Saiyajin 2'],
  [/Super Saiyajin dominado/i, () => 'Super Saiyajin (dominado)'],
  [/Super Saiyajin(?! (de|2|dominado))/i, () => 'Super Saiyajin'],
  [/Super Perfect Cell/i, () => 'Super Perfect Cell'],
  [/fusion(?:ado|arse) con (\w+)/i, (m) => `Fusión con ${m[1]}`],
  [/\btransformado\b/i, () => 'Forma transformada'],
];

/**
 * 
 */
const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
//  Cada vez que se tenga un personaje que oscila mas de 1 millon entonces, tendrá que representarse de forma exponencial
// Si no compara correctamente, entonces mandara un blanco en el DOM
function parsePower(label: string): PowerLevel {
  const nums = [...label.matchAll(/\d[\d.,]*/g)].map((m) => Number(m[0].replace(/[.,]/g, ''))).filter((n) => n > 0);
  const value = nums.length ? Math.max(...nums) : undefined; // pico del arco
  return { ...(value !== undefined && { value }), label, official: value !== undefined && !NOT_OFFICIAL.test(label) };
}

/**
 *  Si el matching corresponde con las reglas de transformacion (expresion regulares)
 *  Destacara la transformacion y mostrara el nombre del personaje sino no hara nada
 * @param labe
 * @returns 
 */
const detectTransformations = (label = '') =>
  TRANSFORMATION_RULES.flatMap(([re, make]) => { const m = label.match(re); return m ? [make(m)] : []; });

/**
 * "Daño Causado: Medio-alto" -> 'mid'. Toma el PRIMER nivel mencionado; "alto" + "máx" = 'max'.
 * "Ninguno" o textos sin nivel ("Habilidad de Supervivencia") -> sin impacto (técnica de utilidad).
 */
// Con expresiones regulares
function parseImpact(raw?: string): Impact | undefined {
  if (!raw) return undefined;
  const t = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  if (/ningun/.test(t)) return undefined;
  const levels: [RegExp, Impact][] = [[/max/, 'max'], [/alt/, 'high'], [/medi|intermed/, 'mid'], [/baj|minim/, 'low']];
  const hits = levels.map(([re, lvl]) => ({ lvl, at: t.search(re) })).filter((h) => h.at >= 0).sort((a, b) => a.at - b.at);
  if (!hits.length) return undefined;
  const first = hits[0].lvl;
  return first === 'high' && hits.some((h) => h.lvl === 'max') ? 'max' : first;
}

/** Tier por escala logarítmica dentro del arco: 5 = cerca del máximo, 1 = cerca del mínimo. */
// Despues de 1 million el usuario notara la escala exponencial de los niveles de poder
// unicamente a partir del arco de cel.
function computeTiers(items: { id: string; power?: PowerLevel }[]) {
  const vals = items.map((c) => c.power?.value).filter((v): v is number => v !== undefined);
  const tiers = new Map<string, Tier>();
  if (vals.length < 2) return tiers;
  const hi = Math.log10(Math.max(...vals));
  const lo = Math.log10(Math.min(...vals));
  const step = (hi - lo) / 5 || 1;
  for (const c of items) {
    if (c.power?.value === undefined) continue;
    const t = 5 - Math.floor((hi - Math.log10(c.power.value)) / step);
    tiers.set(c.id, Math.min(5, Math.max(1, t)) as Tier);
  }
  return tiers;
}

// ---------- Ejecución ----------
  // La lectura del banco de datos (lectura de las propiedad levelpower y charactername en el despliegue de los personajes)
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const saga = process.argv[2] as SagaId;
if (!SAGAS.includes(saga)) fail(`Saga inválida "${saga}". Opciones: ${SAGAS.join(', ')}`);

const source = readJsonIf<SourceFile>(`data-raw/${saga}.source.json`);
const legacy = readJsonIf<LegacyEntry[]>(`data-raw/${saga}.legacy.json`) ?? [];
const editorial = readJsonIf<Record<string, EditorialEntry>>(`data-raw/${saga}.editorial.json`);
if (!editorial) fail(`Falta data-raw/${saga}.editorial.json`);
if (!source && !legacy.length) fail(`No hay fuente ni legacy para "${saga}"`);

type Draft = Omit<Character, 'role' | 'race' | 'tier'> & { race?: Race; rawRace?: string };
const errors: string[] = [];
const notes: { id: string; text: string }[] = [];
const impactLog: { raw: string; impact: Impact | undefined }[] = [];
const drafts: Draft[] = [];

// 1) Fuente manual (por arcos)
  //Super | GT --> Personajes
  //Daima | Super-2 --> Vacio
for (const [arc, items] of Object.entries(source?.sagas ?? {})) {
  for (const raw of items) {
    drafts.push({
      id: `${slug(raw.nombre)}-${saga}-${arc}`,
      name: raw.nombre.trim(),
      saga,
      arc,
      race: RACE_MAP[raw.origen_raza],
      rawRace: raw.origen_raza,
      power: parsePower(raw.nivel_poder),
      signatureTechnique: raw.mejor_tecnica.trim(),
      description: raw.descripcion.trim(),
    });
  }
}

// 2) Legacy (HTML original): crea registros nuevos o enriquece uno existente
const toTechnique = (t: NonNullable<LegacyEntry['tecnicas']>[number]): Technique => {
  const impact = parseImpact(t.impacto);
  if (t.impacto) impactLog.push({ raw: t.impacto, impact });
  return { name: t.nombre, description: t.descripcion, ...(impact && { impact }) };
};
const toWeakness = (w: NonNullable<LegacyEntry['debilidades']>[number]): Weakness => ({ name: w.nombre, description: w.descripcion });

for (const l of legacy) {
  const techniques = l.tecnicas?.map(toTechnique);
  const weaknesses = l.debilidades?.map(toWeakness);
  const tag = l.fusionar_con ?? `${slug(l.nombre)}-${saga}${l.arco ? `-${l.arco}` : ''}`;
  l.notas?.forEach((text) => notes.push({ id: tag, text }));
  if (l.nombre !== l.nombre_original) notes.push({ id: tag, text: `nombre corregido: "${l.nombre_original}" → "${l.nombre}"` });

  if (l.fusionar_con) {
    const target = drafts.find((d) => d.id === l.fusionar_con);
    if (!target) { errors.push(`legacy "${l.nombre}": fusionar_con apunta a "${l.fusionar_con}", que no existe`); continue; }
    if (!target.image && l.imagen) target.image = l.imagen;
    if (techniques) target.techniques = [...(target.techniques ?? []), ...techniques];
    if (weaknesses) target.weaknesses = [...(target.weaknesses ?? []), ...weaknesses];
    notes.push({ id: target.id, text: `fusionado con la ficha de la página de ${l.origen}: imagen + ${techniques?.length ?? 0} técnicas (su descripción antigua se descartó)` });
    continue;
  }

  const id = tag;
  const dup = drafts.find((d) => d.id === id);
  if (dup) { // mismo personaje repetido en el HTML (p. ej. Puar)
    dup.description = `${dup.description} ${l.descripcion}`.trim();
    if (techniques) dup.techniques = [...(dup.techniques ?? []), ...techniques];
    if (weaknesses) dup.weaknesses = [...(dup.weaknesses ?? []), ...weaknesses];
    notes.push({ id, text: 'aparecía dos veces en el HTML: descripciones y técnicas fusionadas en una ficha' });
    continue;
  }
  const legacyPower: PowerLevel | undefined =
    typeof   l.nivel_poder === 'number' ? { value: l.nivel_poder, label: l.nivel_poder.toLocaleString('es-MX'), official: false }
    : typeof l.nivel_poder === 'string' ? parsePower(l.nivel_poder)
    : undefined;
  drafts.push({
    id, name: l.nombre, saga, ...(l.arco && { arc: l.arco }),
    ...(legacyPower && { power: legacyPower }),
    description: l.descripcion,
    ...(l.imagen && { image: l.imagen }),
    ...(l.transformaciones && { transformations: l.transformaciones }),
    ...(techniques?.length && { techniques }),
    ...(weaknesses?.length && { weaknesses }),
  });
}

// 2b) Niveles de poder definidos aparte (<saga>.power.json: { id: número }) para sagas sin cifras en la fuente
const powerFile = readJsonIf<Record<string, number | string>>(`data-raw/${saga}.power.json`);
for (const [id, value] of Object.entries(powerFile ?? {})) {
  if (id.startsWith('_')) continue;
  const d = drafts.find((x) => x.id === id);
  if (!d) { errors.push(`${saga}.power.json: "${id}" no existe`); continue; }
  if (typeof value !== 'number' || value <= 0) { errors.push(`${saga}.power.json: "${id}" debe ser un número positivo`); continue; }
  if (d.power) { errors.push(`${saga}.power.json: "${id}" ya trae poder en la fuente`); continue; }
  d.power = { value, label: value.toLocaleString('es-MX'), official: false };
}

/**
 * obtiene la lectura del json solo si el id es correcto
 */
const factionIds = new Set((readJsonIf<{ id: string }[]>('src/data/factions.json') ?? []).map((f) => f.id));

// 3) Capa editorial + validación
const tiersByArc = new Map<string, Map<string, Tier>>();
for (const arc of new Set(drafts.map((d) => d.arc ?? ''))) tiersByArc.set(arc, computeTiers(drafts.filter((d) => (d.arc ?? '') === arc)));

const out: Character[] = [];
const review: (Character & { tierSource: string; note?: string })[] = [];
for (const d of drafts) {
  const ed = editorial[d.id];
  if (!ed) { errors.push(`${d.id}: falta en la capa editorial`); continue; }
  if (ed.skip) { notes.push({ id: d.id, text: `excluido de personajes: ${ed.skip}` }); continue; }
  if (ed.faction && !factionIds.has(ed.faction)) errors.push(`${d.id}: facción "${ed.faction}" no existe en src/data/factions.json`);
  for (const [original, fix] of Object.entries(ed.techniqueFixes ?? {})) {
    const t = d.techniques?.find((x) => x.name === original);
    if (!t) { errors.push(`${d.id}: techniqueFixes apunta a "${original}", que no existe`); continue; }
    Object.assign(t, fix);
    notes.push({ id: d.id, text: `técnica corregida: "${original}" → ${JSON.stringify(fix)}` });
  }
  const race = ed.race ?? d.race;
  if (!ROLES.includes(ed.role)) errors.push(`${d.id}: role inválido "${ed.role}"`);
  if (!race || !RACES.includes(race)) errors.push(`${d.id}: raza inválida o sin mapear "${ed.race ?? d.rawRace}"`);
  const computed = tiersByArc.get(d.arc ?? '')?.get(d.id);
  const tier = ed.tier ?? computed;
  if (!tier || !TIERS.includes(tier)) errors.push(`${d.id}: sin tier válido (no hay cifra y no hay tier editorial)`);

  const    transformations = ed.transformations ?? d.transformations ?? detectTransformations(d.power?.label);
  const signatureTechnique = ed.signatureTechnique ?? d.signatureTechnique ?? d.techniques?.[0]?.name;
  const { rawRace, race: _r, transformations: _t, signatureTechnique: _s, ...rest } = d;
  const character: Character = {
    ...rest,
    name: ed.name ?? d.name,
    role: ed.role,
    race: race as Race,
    tier: tier as Tier,
    ...(ed.faction && { faction: ed.faction }),
    ...(signatureTechnique && { signatureTechnique }),
    ...(transformations.length && { transformations }),
    ...(ed.purpose && { purpose: ed.purpose }),
  };
  out.push(character);
  review.push({ ...character, tierSource: ed.tier !== undefined ? 'editorial' : 'calculado', ...(ed.note && { note: ed.note }) });
}

const ids = drafts.map((c) => c.id);
Object.keys(editorial).filter((k) => !k.startsWith('_') && !ids.includes(k))
  .forEach((k) => errors.push(`editorial huérfano (no existe en ninguna fuente): ${k}`));

if (errors.length) fail(`Validación fallida (${errors.length}):\n  - ${errors.join('\n  - ')}`);

const outPath = `src/data/characters/${saga}.json`;
mkdirSync(join(ROOT, dirname(outPath)), { recursive: true });
writeFileSync(join(ROOT, outPath), JSON.stringify(out, null, 2) + '\n');
writeFileSync(join(ROOT, `data-raw/${saga}.review.md`), renderReview());
console.log(`OK  ${out.length} personajes -> ${outPath}   (revisión: data-raw/${saga}.review.md)`);

// ---------- Utilidades ----------

function renderReview() {
  const byArc = Object.groupBy(review, (r) => r.arc ?? 'sin arco');
  let md = `# Revisión editorial — saga ${saga}\n\n`;
  md += `Generado por \`scripts/normalize-saga.ts\`. Edita \`data-raw/${saga}.editorial.json\` y vuelve a correr el script.\n\n`;
  md += `- **${review.length}** personajes · tier editorial en **${review.filter((r) => r.tierSource === 'editorial').length}** (revísalos) · \`purpose\` pendiente en **${review.filter((r) => !r.purpose).length}**.\n\n`;
  for (const [arc, list] of Object.entries(byArc)) {
    md += `## ${arc}\n\n| id | rol | raza | tier | origen tier | poder | transformaciones | técnicas | nota |\n|---|---|---|---|---|---|---|---|---|\n`;
    for (const r of [...(list ?? [])].sort((a, b) => b.tier - a.tier)) {
      md += `| ${r.id} | ${r.role} | ${r.race} | ${r.tier} | ${r.tierSource} | ${r.power?.label ?? '—'} | ${(r.transformations ?? []).join(', ')} | ${r.techniques?.length ?? 0} | ${r.note ?? ''} |\n`;
    }
    md += '\n';
  }
  if (notes.length) {
    md += `## Notas de la extracción\n\n`;
    for (const n of notes) md += `- \`${n.id}\`: ${n.text}\n`;
    md += '\n';
  }
  if (impactLog.length) {
    md += `## Normalización de impacto (verifica el mapeo)\n\n| texto original | impacto |\n|---|---|\n`;
    for (const { raw, impact } of impactLog) md += `| ${raw} | ${impact ?? '— (utilidad)'} |\n`;
  }
  return md;
}

function readJsonIf<T>(rel: string): T | undefined {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return undefined;
  try { return JSON.parse(readFileSync(p, 'utf8')) as T; } catch (e) { fail(`JSON inválido en ${rel}: ${(e as Error).message}`); }
}

function fail(msg: string): never { console.error(msg); process.exit(1); }
