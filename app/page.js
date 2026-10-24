import HomeClient from '../components/HomeClient';
import { getCommunesByRegion, searchSchools } from '../lib/schools';
import { filtersFromParams } from '../utils/filters';

// Server Component: reads the JSON on the server and sends only the
// results the URL asks for; the client fetches the rest from /api/schools.
export default async function Home({ searchParams }) {
  const params = await searchParams;
  const get = (key) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const { page, ...filters } = filtersFromParams(get);

  const initialData = searchSchools({
    q: filters.searchQuery,
    commune: filters.selectedCommune,
    dependency: filters.selectedDependency,
    keywords: filters.keywordQuery,
    page,
    cumulative: true,
  });

  return (
    <HomeClient
      communesByRegion={getCommunesByRegion()}
      initialFilters={filters}
      initialData={initialData}
    />
  );
}
