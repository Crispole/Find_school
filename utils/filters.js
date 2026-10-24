// Filters <-> URL, shared by the server page and the client.
// Example: /?q=san&comuna=Ñuñoa&dependencia=particular&proyecto=Laico,Mixto&pagina=2

export const DEPENDENCY_SLUGS = {
  municipal: 'Municipal',
  subvencionado: 'Particular Subvencionado',
  particular: 'Particular Pagado',
  delegada: 'Corporación de Administración Delegada',
};

const SLUG_BY_DEPENDENCY = Object.fromEntries(
  Object.entries(DEPENDENCY_SLUGS).map(([slug, dependency]) => [dependency, slug])
);

// Limits how many pages a shared link can ask the server to render at once
const MAX_URL_PAGE = 20;

export const EMPTY_FILTERS = {
  searchQuery: '',
  selectedCommune: '',
  selectedDependency: '',
  keywordQuery: [],
};

// `get` returns the raw value of a param (works with URLSearchParams.get or a plain object)
export function filtersFromParams(get) {
  const page = Number.parseInt(get('pagina') || '1', 10);
  return {
    searchQuery: get('q') || '',
    selectedCommune: get('comuna') || '',
    selectedDependency: DEPENDENCY_SLUGS[get('dependencia')] || '',
    keywordQuery: (get('proyecto') || '').split(',').filter(Boolean),
    page: Number.isFinite(page) ? Math.min(Math.max(page, 1), MAX_URL_PAGE) : 1,
  };
}

export function filtersToSearch({ searchQuery, selectedCommune, selectedDependency, keywordQuery }, page = 1) {
  const params = new URLSearchParams();
  if (searchQuery.trim()) params.set('q', searchQuery.trim());
  if (selectedCommune) params.set('comuna', selectedCommune);
  if (SLUG_BY_DEPENDENCY[selectedDependency]) params.set('dependencia', SLUG_BY_DEPENDENCY[selectedDependency]);
  if (keywordQuery.length > 0) params.set('proyecto', keywordQuery.join(','));
  if (page > 1) params.set('pagina', String(Math.min(page, MAX_URL_PAGE)));
  const search = params.toString();
  return search ? `?${search}` : '';
}
