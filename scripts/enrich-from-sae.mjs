// Fills missing website, email, phone, address and coordinates in
// data/schools.json from the public API behind the Mineduc "Vitrina de
// establecimientos" (Sistema de Admisión Escolar, admision.mineduc.cl).
//
// Only schools that take part in the SAE are there (municipal, subsidized,
// delegated administration); private paid schools are not.
//
// Usage: node scripts/enrich-from-sae.mjs [--refresh]
//   Responses are cached in data/raw/sae/ (git-ignored), so the script can be
//   re-run or resumed without hitting the API again. --refresh ignores the cache.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const API = 'https://apisae.mineduc.cl/sae-api-vitrina/v1/establecimientos/';
const SCHOOLS_PATH = fileURLToPath(new URL('../data/schools.json', import.meta.url));
const CACHE_DIR = fileURLToPath(new URL('../data/raw/sae/', import.meta.url));
const CONCURRENCY = 4;
const DELAY_MS = 150; // pause between requests of each worker, to be gentle with the API

const refresh = process.argv.includes('--refresh');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const NO_INFO = /^(sin informaci[oó]n|no (tiene|posee|aplica)|s\/i|-+|0+)$/i;

// "WWW.Colegio.CL/" -> "www.colegio.cl"; rejects placeholders and malformed values
const cleanWebsite = (value) => {
  const url = (value || '').trim().replace(/\s+/g, '');
  if (!url || NO_INFO.test(url) || !/^[^@]+\.[a-z]{2,}/i.test(url.replace(/^https?:\/\//i, ''))) return null;
  return url.replace(/^(https?:\/\/)?([^/]+)/i, (m, protocol = '', host) => `${protocol.toLowerCase()}${host.toLowerCase()}`).replace(/\/$/, '');
};

const cleanEmail = (value) => {
  const email = (value || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(email) ? email : null;
};

const cleanPhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 8 ? digits : null;
};

const titleCase = (str) => str.toLowerCase().replace(/(^|\s)\p{L}/gu, (c) => c.toUpperCase());

async function fetchSchool(rbd) {
  const cachePath = `${CACHE_DIR}${rbd}.json`;
  if (!refresh && existsSync(cachePath)) return JSON.parse(readFileSync(cachePath, 'utf8'));

  const res = await fetch(`${API}${rbd}`, { headers: { Accept: 'application/json' } });
  // 404/204: the school is not in the SAE; cache it so we do not ask again
  const data = res.ok && res.status !== 204 ? await res.json().catch(() => null) : null;
  if (!res.ok && res.status !== 404 && res.status !== 204) throw new Error(`HTTP ${res.status}`);
  writeFileSync(cachePath, JSON.stringify(data));
  await sleep(DELAY_MS);
  return data;
}

mkdirSync(CACHE_DIR, { recursive: true });
const schools = JSON.parse(readFileSync(SCHOOLS_PATH, 'utf8'));
const rbds = [...new Set(schools.map((s) => s.rbd).filter(Number.isInteger))];
const details = new Map();
const failed = [];

let next = 0;
let done = 0;
async function worker() {
  while (next < rbds.length) {
    const rbd = rbds[next++];
    try {
      details.set(rbd, await fetchSchool(rbd));
    } catch (error) {
      failed.push(`${rbd} (${error.message})`);
    }
    if (++done % 200 === 0) console.log(`  ${done}/${rbds.length} consultados…`);
  }
}
console.log(`Consultando ${rbds.length} RBD en la API del SAE…`);
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const added = { website: 0, email: 0, phone: 0, address: 0, coordinates: 0 };
let found = 0;
for (const school of schools) {
  const detail = details.get(school.rbd);
  if (!detail) continue;
  found++;

  // Existing values win: they may have been curated by hand
  const website = cleanWebsite(detail.url);
  if (!school.website && website) { school.website = website; added.website++; }

  const email = cleanEmail(detail.mail);
  if (!school.email && email) { school.email = email; added.email++; }

  const phone = cleanPhone(detail.telefono);
  if (!school.phone && phone) { school.phone = phone; added.phone++; }

  const sede = detail.sedes?.find((s) => s.codigoSede === 1) || detail.sedes?.[0];
  const street = sede?.direccion?.calle?.trim();
  if (!school.address && street && !NO_INFO.test(street)) { school.address = titleCase(street); added.address++; }

  const [lng, lat] = sede?.direccion?.coordenadas?.coordinates || [];
  if (!Number.isFinite(school.lat) && Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0) {
    school.lat = Number(lat.toFixed(6));
    school.lng = Number(lng.toFixed(6));
    added.coordinates++;
  }
}

writeFileSync(SCHOOLS_PATH, JSON.stringify(schools));
console.log(`Encontrados en el SAE: ${found} de ${schools.length} colegios`);
console.log('Datos agregados:', added);
if (failed.length > 0) console.log(`Fallaron ${failed.length} consultas (vuelve a ejecutar para reintentar): ${failed.slice(0, 10).join(', ')}`);
