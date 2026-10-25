// Adds lat/lng to data/schools.json by matching the RBD against a Mineduc CSV
// that has RBD, LATITUD and LONGITUD columns (Directorio Oficial de
// Establecimientos, or the "Establecimientos de Educación Escolar" layer).
//
// Usage: node scripts/add-coordinates.mjs <path-to-csv> [--overwrite]
//   Schools that already have coordinates (e.g. from scripts/enrich-from-sae.mjs,
//   which are more recent) are kept unless --overwrite is passed.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SCHOOLS_PATH = fileURLToPath(new URL('../data/schools.json', import.meta.url));

// Rough bounding box of Chile (including Easter Island) to discard bad coordinates
const isInChile = (lat, lng) => lat > -56.5 && lat < -17 && lng > -110 && lng < -66;

// "-33,4569" or "-33.4569" -> -33.4569
const parseCoordinate = (value) => Number.parseFloat(String(value).trim().replace(/"/g, '').replace(',', '.'));

// Minimal CSV line splitter that respects quoted fields
const splitLine = (line, delimiter) => {
  const cells = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === delimiter && !quoted) {
      cells.push(current);
      current = '';
    } else current += char;
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
};

const csvPath = process.argv.slice(2).find((arg) => !arg.startsWith('--'));
const overwrite = process.argv.includes('--overwrite');
if (!csvPath) {
  console.error('Uso: node scripts/add-coordinates.mjs <archivo.csv>');
  process.exit(1);
}

// Mineduc files are usually latin1 (a UTF-8 BOM then reads as 3 chars); the columns we need are ASCII either way
const lines = readFileSync(csvPath, 'latin1').replace(/^\u00EF\u00BB\u00BF/, '').split(/\r?\n/).filter(Boolean);
// Itrend files may use "|"; Mineduc ones usually ";"
const delimiter = [';', ',', '|', '\t']
  .map((candidate) => ({ candidate, count: lines[0].split(candidate).length }))
  .sort((a, b) => b.count - a.count)[0].candidate;
const header = splitLine(lines[0], delimiter).map((name) => name.replace(/"/g, '').toUpperCase());

const rbdIndex = header.indexOf('RBD');
const latIndex = header.indexOf('LATITUD');
const lngIndex = header.indexOf('LONGITUD');
if ([rbdIndex, latIndex, lngIndex].includes(-1)) {
  console.error(`El CSV debe tener columnas RBD, LATITUD y LONGITUD. Encontradas: ${header.join(', ')}`);
  process.exit(1);
}

const coordinatesByRbd = new Map();
for (const line of lines.slice(1)) {
  const cells = splitLine(line, delimiter);
  const rbd = Number.parseInt(cells[rbdIndex], 10);
  const lat = parseCoordinate(cells[latIndex]);
  const lng = parseCoordinate(cells[lngIndex]);
  if (Number.isInteger(rbd) && isInChile(lat, lng)) coordinatesByRbd.set(rbd, { lat, lng });
}

const schools = JSON.parse(readFileSync(SCHOOLS_PATH, 'utf8'));
let matched = 0;
for (const school of schools) {
  const coordinates = coordinatesByRbd.get(school.rbd);
  if (coordinates && (overwrite || !Number.isFinite(school.lat))) {
    school.lat = Number(coordinates.lat.toFixed(6));
    school.lng = Number(coordinates.lng.toFixed(6));
    matched++;
  }
}

writeFileSync(SCHOOLS_PATH, JSON.stringify(schools));
console.log(`CSV: ${coordinatesByRbd.size} establecimientos con coordenadas válidas`);
console.log(`Colegios ubicados: ${matched} de ${schools.length} (${schools.length - matched} sin ubicación)`);
