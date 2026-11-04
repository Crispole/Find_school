// Imports PAES (regular) average scores per school (RBD) into data/schools.json.
//
// Source: DEMRE Universidad de Chile, "Portal Bases de Datos" (datos abiertos,
// https://portal-transparencia.demre.cl/portal-base-datos). Download the
// "Rendición" file of the regular process (ArchivoC_Adm<año>REG.csv).
// The winter process (INV) is optional and self-selected: do not use it here.
//
// Usage: node scripts/import-paes.mjs <ArchivoC_AdmXXXXREG.csv> <año de admisión>
//        e.g. node scripts/import-paes.mjs data/raw/paes/ArchivoC_Adm2026REG.csv 2026
//
// Each row is one student. Scores are the student's REGULAR-process scores of the
// current admission (<PRUEBA>_REG_ACTUAL); empty or 0 means the test was not taken.
// Students of the current and of previous graduating classes are both included,
// as in DEMRE's own per-school report.
//
// Writes per school: paes_language (Competencia Lectora), paes_math (Matemática 1),
// paes_ptu_matematica2, paes_ptu_historia, paes_ptu_ciencias and paes_year.
// An average is only published when at least MIN_STUDENTS took that test.
// Previous PAES values are replaced so a school never mixes years.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const [csvPath, year] = process.argv.slice(2);
if (!csvPath || !/^\d{4}$/.test(year || '')) {
  console.error('Uso: node scripts/import-paes.mjs <ArchivoC_AdmXXXXREG.csv> <año>');
  process.exit(1);
}

const SCHOOLS_PATH = fileURLToPath(new URL('../data/schools.json', import.meta.url));
const MIN_STUDENTS = 5;

// schools.json field -> CSV column
const TESTS = {
  paes_language: 'CLEC_REG_ACTUAL',
  paes_math: 'MATE1_REG_ACTUAL',
  paes_ptu_matematica2: 'MATE2_REG_ACTUAL',
  paes_ptu_historia: 'HCSOC_REG_ACTUAL',
  paes_ptu_ciencias: 'CIEN_REG_ACTUAL',
};

const unquote = (s) => s.replace(/^"|"$/g, '');
const lines = readFileSync(csvPath, 'latin1').split(/\r?\n/).filter(Boolean);
const header = lines[0].split(';').map(unquote);
const col = Object.fromEntries(header.map((name, i) => [name, i]));
for (const name of ['RBD', ...Object.values(TESTS)]) {
  if (!(name in col)) {
    console.error(`El archivo no tiene la columna ${name}`);
    process.exit(1);
  }
}

// rbd -> { field: { sum, n } }
const acc = new Map();
for (const line of lines.slice(1)) {
  const cells = line.split(';').map(unquote);
  const rbd = Number(cells[col.RBD]);
  if (!rbd) continue;
  const entry = acc.get(rbd) || {};
  for (const [field, column] of Object.entries(TESTS)) {
    const score = Number(cells[col[column]]);
    if (!Number.isFinite(score) || score <= 0) continue;
    const t = (entry[field] ||= { sum: 0, n: 0 });
    t.sum += score;
    t.n += 1;
  }
  acc.set(rbd, entry);
}

const schools = JSON.parse(readFileSync(SCHOOLS_PATH, 'utf8'));
const stats = { updated: 0, cleared: 0, tooSmall: 0 };
for (const school of schools) {
  const hadPaes = school.paes_language != null || school.paes_math != null;
  for (const key of Object.keys(school)) if (key.startsWith('paes_')) delete school[key];

  const entry = acc.get(school.rbd);
  let any = false;
  for (const field of Object.keys(TESTS)) {
    const t = entry?.[field];
    if (!t) continue;
    if (t.n < MIN_STUDENTS) {
      stats.tooSmall += 1;
      continue;
    }
    school[field] = Math.round((t.sum / t.n) * 10) / 10;
    any = true;
  }
  if (any) {
    school.paes_year = Number(year);
    stats.updated += 1;
  } else if (hadPaes) {
    stats.cleared += 1;
  }
}

writeFileSync(SCHOOLS_PATH, JSON.stringify(schools));
console.log(`PAES ${year}: ${stats.updated} colegios actualizados.`);
console.log(`${stats.cleared} colegios tenían PAES anterior pero no tienen datos suficientes en ${year}: se les quitó para no mezclar años.`);
console.log(`${stats.tooSmall} promedios omitidos por tener menos de ${MIN_STUDENTS} estudiantes.`);
