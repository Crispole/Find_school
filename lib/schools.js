// Server-only data access. The JSON never reaches the browser bundle:
// pages and API routes call these helpers and return only what is needed.
import 'server-only';
import schoolsData from '../data/schools.json';

const DEFAULT_PAGE_SIZE = 24;
const MAX_PAGE_SIZE = 100;

// Lowercase and strip accents so "nunoa" matches "Ñuñoa"
const normalize = (str) =>
  (str || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const indexed = schoolsData
  .map((school) => ({
    school,
    searchName: normalize(school.name),
    searchKeywords: (school.keywords || []).map(normalize),
  }))
  .sort((a, b) => a.school.name.localeCompare(b.school.name, 'es'));

const byId = new Map(schoolsData.map((school) => [school.id, school]));

// Fields the cards and modals use (tuition_details stays on the server)
const toPublic = ({ tuition_details, ...school }) => school;

export function searchSchools({ q = '', commune = '', dependency = '', keywords = [], page = 1, pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const query = normalize(q);
  const targetKeywords = keywords.map(normalize).filter(Boolean);
  const size = Math.min(Math.max(1, pageSize), MAX_PAGE_SIZE);
  const current = Math.max(1, page);

  const matches = indexed.filter(({ school, searchName, searchKeywords }) => {
    if (query && !searchName.includes(query)) return false;
    if (commune && school.commune !== commune) return false;
    if (dependency && school.dependency !== dependency) return false;
    if (targetKeywords.length > 0) {
      return targetKeywords.every((target) => searchKeywords.some((kw) => kw.includes(target)));
    }
    return true;
  });

  const start = (current - 1) * size;
  return {
    items: matches.slice(start, start + size).map(({ school }) => toPublic(school)),
    total: matches.length,
    page: current,
    pageSize: size,
    totalPages: Math.ceil(matches.length / size),
  };
}

export function getSchoolById(id) {
  const school = byId.get(Number(id));
  return school ? toPublic(school) : null;
}

// Communes grouped by region, for the commune <select>
export function getCommunesByRegion() {
  const regions = new Map();
  for (const { commune, region } of schoolsData) {
    if (!commune) continue;
    const key = region || 'Sin región';
    if (!regions.has(key)) regions.set(key, new Set());
    regions.get(key).add(commune);
  }
  return [...regions.entries()]
    .map(([region, communes]) => ({ region, communes: [...communes].sort((a, b) => a.localeCompare(b, 'es')) }))
    .sort((a, b) => a.region.localeCompare(b.region, 'es'));
}
