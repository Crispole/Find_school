// Adds coordinates to schools that still lack them (mostly private paid schools,
// which are not in the SAE) using OpenStreetMap's Nominatim geocoder.
//
//   1. Schools with an address: geocode the address.
//   2. Schools without one: search the school name; only results tagged as a
//      school/college whose name contains the school's distinctive words count.
// Either way a result is accepted only if it lies in the school's commune.
//
// Respects the Nominatim usage policy: 1 request per second, identifying
// User-Agent, results cached in data/raw/geocode/ (git-ignored).
//
// Usage: node scripts/geocode-osm.mjs
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SCHOOLS_PATH = fileURLToPath(new URL('../data/schools.json', import.meta.url));
const CACHE_DIR = fileURLToPath(new URL('../data/raw/geocode/', import.meta.url));
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
const USER_AGENT = 'EncuentraTuColegio/1.0 (github.com/Crispole/Find_school; one-off geocoding)';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const STOP = new Set(['colegio', 'escuela', 'liceo', 'instituto', 'school', 'college', 'de', 'la', 'el', 'los', 'las', 'del', 'the', 'y', 'particular', 'part', 'col', 'esc', 'san', 'santa', 'saint', 'st', 'basica', 'english', 'ingles']);
const distinctiveWords = (name) => norm(name).replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

// Nominatim returns the commune as city/town/village/municipality (or suburb inside
// Greater Santiago). Only administrative fields count: streets and neighbourhoods
// named after communes ("Rancagua" street in Concepción, "La Florida" in Talca) do not.
const ADMIN_FIELDS = ['city', 'town', 'village', 'municipality', 'suburb', 'city_district'];
const inCommune = (result, commune) => {
  const target = norm(commune);
  return ADMIN_FIELDS.some((field) => norm(result.address?.[field]) === target);
};

let lastRequest = 0;
async function geocode(query, key) {
  const cachePath = `${CACHE_DIR}${key}.json`;
  if (existsSync(cachePath)) return JSON.parse(readFileSync(cachePath, 'utf8'));

  const wait = 1100 - (Date.now() - lastRequest);
  if (wait > 0) await sleep(wait);
  lastRequest = Date.now();

  const params = new URLSearchParams({ q: query, format: 'jsonv2', addressdetails: '1', countrycodes: 'cl', limit: '5' });
  const res = await fetch(`${NOMINATIM}?${params}`, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'es' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const results = await res.json();
  writeFileSync(cachePath, JSON.stringify(results));
  return results;
}

mkdirSync(CACHE_DIR, { recursive: true });
const schools = JSON.parse(readFileSync(SCHOOLS_PATH, 'utf8'));
const pending = schools.filter((s) => !Number.isFinite(s.lat) && s.commune);

// Safety net: a result far from the other schools of its commune is a homonym
// in another city (e.g. a "La Florida" neighbourhood in Talca), so it is rejected.
const MAX_KM_FROM_COMMUNE = 40;
const median = (values) => values.sort((a, b) => a - b)[values.length >> 1];
const communeCenters = {};
for (const s of schools) {
  if (Number.isFinite(s.lat)) (communeCenters[s.commune] ??= []).push([s.lat, s.lng]);
}
for (const [commune, points] of Object.entries(communeCenters)) {
  communeCenters[commune] = [median(points.map((p) => p[0])), median(points.map((p) => p[1]))];
}
const distanceKm = ([lat1, lng1], [lat2, lng2]) => {
  const rad = (x) => (x * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lng2 - lng1) / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(a));
};
const nearCommune = (result, commune) => {
  const center = communeCenters[commune];
  return !center || distanceKm(center, [Number(result.lat), Number(result.lon)]) <= MAX_KM_FROM_COMMUNE;
};
console.log(`Ubicando ${pending.length} colegios sin coordenadas…`);

const stats = { byAddress: 0, byName: 0, notFound: 0, failed: 0 };
let processed = 0;
for (const school of pending) {
  try {
    let match = null;

    if (school.address) {
      const street = school.address.includes(school.commune) ? school.address : `${school.address}, ${school.commune}`;
      const results = await geocode(`${street}, Chile`, `addr-${school.id}`);
      match = results.find((r) => inCommune(r, school.commune) && nearCommune(r, school.commune));
      if (match) stats.byAddress++;
    }

    if (!match) {
      const words = distinctiveWords(school.name);
      if (words.length > 0) {
        const results = await geocode(`${school.name}, ${school.commune}, Chile`, `name-${school.id}`);
        match = results.find((r) =>
          ['school', 'college', 'kindergarten'].includes(r.type) &&
          inCommune(r, school.commune) &&
          nearCommune(r, school.commune) &&
          words.every((w) => norm(r.name).includes(w)));
        if (match) stats.byName++;
      }
    }

    if (match) {
      school.lat = Number(Number(match.lat).toFixed(6));
      school.lng = Number(Number(match.lon).toFixed(6));
    } else {
      stats.notFound++;
    }
  } catch (error) {
    stats.failed++;
    console.warn(`  ${school.name}: ${error.message}`);
  }
  if (++processed % 50 === 0) {
    console.log(`  ${processed}/${pending.length}…`);
    writeFileSync(SCHOOLS_PATH, JSON.stringify(schools)); // keep progress if interrupted
  }
}

writeFileSync(SCHOOLS_PATH, JSON.stringify(schools));
console.log('Resultado:', stats);
