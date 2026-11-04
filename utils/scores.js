// Score tests a user can filter by. Shared by the client (filter bar, URL) and
// the server (lib/schools.js), so it must stay free of server-only imports.
// `slug` is what travels in the URL (?prueba=paes-mat), `field` the key in schools.json.

export const SCORE_METRICS = [
  { slug: 'simce-2m-mat', group: 'SIMCE 2° medio', label: 'Matemática', field: 'simce_2m_math' },
  { slug: 'simce-2m-len', group: 'SIMCE 2° medio', label: 'Lenguaje', field: 'simce_2m_language' },
  { slug: 'simce-8b-mat', group: 'SIMCE 8° básico', label: 'Matemática', field: 'simce_8b_math' },
  { slug: 'simce-8b-len', group: 'SIMCE 8° básico', label: 'Lenguaje', field: 'simce_8b_language' },
  { slug: 'simce-4b-mat', group: 'SIMCE 4° básico', label: 'Matemática', field: 'simce_4b_math' },
  { slug: 'simce-4b-len', group: 'SIMCE 4° básico', label: 'Lenguaje', field: 'simce_4b_language' },
  { slug: 'paes-mat', group: 'PAES', label: 'Matemática 1', field: 'paes_math' },
  { slug: 'paes-len', group: 'PAES', label: 'Competencia Lectora', field: 'paes_language' },
];

const FIELD_BY_SLUG = Object.fromEntries(SCORE_METRICS.map(({ slug, field }) => [slug, field]));

export const isScoreMetric = (slug) => Object.hasOwn(FIELD_BY_SLUG, slug);
export const scoreFieldFor = (slug) => (isScoreMetric(slug) ? FIELD_BY_SLUG[slug] : null);

export const MAX_SCORE = 1000; // PAES goes up to 1000, SIMCE stays below it

// "550" -> 550; anything non numeric or out of range -> '' (no filter)
export function parseMinScore(value) {
  const n = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, MAX_SCORE) : '';
}
