// Imports SIMCE averages per school (RBD) into data/schools.json.
//
// Source: Agencia de Calidad de la Educación, "Bases de datos de acceso público"
// (https://informacionestadistica.agenciaeducacion.cl). Download the "Simce <año>
// - Todos los grados" archive, extract it and copy the three CSVs
// (simce2m<año>_rbd_final.csv, simce4b..., simce8b...) into data/raw/simce/<año>/.
//
// Usage: node scripts/import-simce.mjs <año>      (e.g. 2025)
//
// Writes per school: simce_2m_*, simce_4b_*, simce_8b_* (language, math; 8b also
// history) and simce_year. simce_language / simce_math are kept as aliases of the
// 2º medio scores, which is what the map and cards read.
// Previous SIMCE values are replaced so a school never mixes years.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const year = process.argv[2];
if (!/^\d{4}$/.test(year || '')) {
  console.error('Uso: node scripts/import-simce.mjs <año>');
  process.exit(1);
}

const SCHOOLS_PATH = fileURLToPath(new URL('../data/schools.json', import.meta.url));
const RAW_DIR = fileURLToPath(new URL(`../data/raw/simce/${year}/`, import.meta.url));

// grade code -> subjects present in the CSV (column prom_<subject><grade>_rbd)
const GRADES = [
  { code: '2m', subjects: { language: 'lect', math: 'mate' } },
  { code: '4b', subjects: { language: 'lect', math: 'mate' } },
  { code: '8b', subjects: { language: 'lect', math: 'mate', history: 'hist' } },
];

const toScore = (value) => {
  const n = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(n) && n > 0 ? n : null; // empty / "0" / non-numeric = no score
};

const readCsv = (path) => {
  const [header, ...rows] = readFileSync(path, 'latin1').split(/\r?\n/).filter(Boolean);
  const cols = header.split(';');
  return rows.map((row) => {
    const cells = row.split(';');
    return Object.fromEntries(cols.map((name, i) => [name, cells[i]]));
  });
};

// rbd -> { simce_<grade>_<subject>: score }
const byRbd = new Map();
for (const { code, subjects } of GRADES) {
  const path = `${RAW_DIR}simce${code}${year}_rbd_final.csv`;
  if (!existsSync(path)) {
    console.warn(`Falta ${path}, se omite ${code}`);
    continue;
  }
  for (const row of readCsv(path)) {
    const rbd = Number(row.rbd);
    if (!rbd) continue;
    const entry = byRbd.get(rbd) || {};
    for (const [subject, key] of Object.entries(subjects)) {
      const score = toScore(row[`prom_${key}${code}_rbd`]);
      if (score !== null) entry[`simce_${code}_${subject}`] = score;
    }
    byRbd.set(rbd, entry);
  }
}

const schools = JSON.parse(readFileSync(SCHOOLS_PATH, 'utf8'));
const stats = { updated: 0, cleared: 0, withSecondary: 0, unmatched: 0 };

for (const school of schools) {
  const hadSimce = school.simce_language != null || school.simce_math != null;
  for (const key of Object.keys(school)) if (key.startsWith('simce_')) delete school[key];

  const scores = byRbd.get(school.rbd);
  if (!scores) {
    if (hadSimce) stats.cleared += 1;
    continue;
  }
  Object.assign(school, scores, { simce_year: Number(year) });
  if (scores.simce_2m_language != null) school.simce_language = scores.simce_2m_language;
  if (scores.simce_2m_math != null) school.simce_math = scores.simce_2m_math;
  if (scores.simce_2m_language != null || scores.simce_2m_math != null) stats.withSecondary += 1;
  stats.updated += 1;
}

const known = new Set(schools.map((s) => s.rbd));
stats.unmatched = [...byRbd.keys()].filter((rbd) => !known.has(rbd)).length;

writeFileSync(SCHOOLS_PATH, JSON.stringify(schools));
console.log(`SIMCE ${year}: ${stats.updated} colegios actualizados (${stats.withSecondary} con 2º medio).`);
console.log(`${stats.cleared} colegios tenían SIMCE anterior pero no aparecen en ${year}: se les quitó para no mezclar años.`);
console.log(`${stats.unmatched} RBD del SIMCE no existen en schools.json (se ignoran).`);
