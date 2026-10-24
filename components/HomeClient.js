'use client';

import { useState, useEffect, useRef } from 'react';
import SchoolCard from './SchoolCard';
import FilterBar from './FilterBar';
import Hero from './Hero';
import Navbar from './Navbar';
import ComparisonModal from './ComparisonModal';
import { EXCHANGE_RATES } from '../utils/currency';
import { EMPTY_FILTERS, filtersFromParams, filtersToSearch } from '../utils/filters';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

const SEARCH_DEBOUNCE_MS = 300;

const buildQuery = ({ searchQuery, selectedCommune, selectedDependency, keywordQuery }, page) => {
  const params = new URLSearchParams();
  if (searchQuery.trim()) params.set('q', searchQuery.trim());
  if (selectedCommune) params.set('commune', selectedCommune);
  if (selectedDependency) params.set('dependency', selectedDependency);
  if (keywordQuery.length > 0) params.set('keywords', keywordQuery.join(','));
  params.set('page', String(page));
  return params.toString();
};

// Keeps filters and page in the address bar without a server round trip, so
// links can be shared and the Back button returns to the same results
const syncUrl = (filters, page) => {
  const url = `${window.location.pathname}${filtersToSearch(filters, page)}`;
  if (url !== `${window.location.pathname}${window.location.search}`) {
    window.history.replaceState(null, '', url);
  }
};

export default function HomeClient({ communesByRegion, initialFilters = EMPTY_FILTERS, initialData }) {
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery);
  const [keywordQuery, setKeywordQuery] = useState(initialFilters.keywordQuery);
  const [selectedCommune, setSelectedCommune] = useState(initialFilters.selectedCommune);
  const [selectedDependency, setSelectedDependency] = useState(initialFilters.selectedDependency);
  const [currency, setCurrency] = useState('CLP');
  const [exchangeRates, setExchangeRates] = useState(EXCHANGE_RATES);
  const [theme, setTheme] = useState('light');
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const [schools, setSchools] = useState(initialData.items);
  const [total, setTotal] = useState(initialData.total);
  const [page, setPage] = useState(initialData.page);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters (without page) of the results currently on screen
  const loadedQueryRef = useRef(filtersToSearch(initialFilters));
  const abortRef = useRef(null);

  const filters = { searchQuery, selectedCommune, selectedDependency, keywordQuery };

  // `cumulative` loads pages 1..pageToLoad at once (restoring a URL with ?pagina=N)
  const fetchPage = async (pageToLoad, { append = false, cumulative = false, from = filters } = {}) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError('');
    try {
      const query = buildQuery(from, pageToLoad) + (cumulative ? '&cumulative=1' : '');
      const res = await fetch(`/api/schools?${query}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSchools((prev) => (append ? [...prev, ...data.items] : data.items));
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
      syncUrl(from, data.page);
    } catch (e) {
      if (e.name !== 'AbortError') setError('No se pudieron cargar los colegios. Intenta nuevamente.');
    } finally {
      if (abortRef.current === controller) setIsLoading(false);
    }
  };

  // Re-query page 1 when the filters differ from the results on screen
  // (debounced for typing). The initial render already has the server data.
  useEffect(() => {
    const query = filtersToSearch(filters);
    if (query === loadedQueryRef.current) return;
    const timer = setTimeout(() => {
      loadedQueryRef.current = query;
      fetchPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCommune, selectedDependency, keywordQuery]);

  // Back/Forward can restore a cached render made for another URL: when the
  // address bar disagrees with the results on screen, trust the address bar
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const { page: urlPage, ...urlFilters } = filtersFromParams((key) => urlParams.get(key));
    if (filtersToSearch(urlFilters, urlPage) === filtersToSearch(initialFilters, initialData.page)) return;

    loadedQueryRef.current = filtersToSearch(urlFilters);
    setSearchQuery(urlFilters.searchQuery);
    setSelectedCommune(urlFilters.selectedCommune);
    setSelectedDependency(urlFilters.selectedDependency);
    setKeywordQuery(urlFilters.keywordQuery);
    fetchPage(urlPage, { cumulative: true, from: urlFilters });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const fetchRates = async () => {
        try {
            const res = await fetch('/api/indicators');
            if (res.ok) {
                const data = await res.json();
                setExchangeRates({ CLP: 1, UF: data.UF, USD: data.USD });
            }
        } catch {
            console.error("Failed to fetch rates, using defaults.");
        }
    };
    fetchRates();

    // Set global callback for Navbar
    window.startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: [
                { element: '#tour-filters', popover: { title: 'Filtros', description: 'Selecciona el tipo de establecimiento: Todos - Municipales - Subvencionados - Particulares - Adm. Delegada' } },
                { element: '#tour-compare', popover: { title: 'Compara', description: 'Elige dos establecimientos y compara sus características.' } },
                { element: '#tour-currency', popover: { title: 'Divisa', description: 'Selecciona la divisa que más te acomode.' } },
                { element: '.tour-card-commune', popover: { title: 'Ubicación', description: 'Encuentra el establecimiento en Google Maps' } },
                { element: '.tour-card-fees', popover: { title: 'Resultados', description: 'Revisa los resultados SIMCE y PAES del establecimiento.' } },
                { element: '.tour-card-website', popover: { title: 'Sitio Web', description: 'Vamos a la página oficial del establecimiento.' } },
                { element: '.tour-card-contact', popover: { title: 'Contactar', description: '¿Tienes dudas? Envía un correo para solicitar más información del establecimiento.' } }
            ]
        });
        driverObj.drive();
    };

    // Check for tutorial query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tutorial') === 'true') {
      // Small delay to ensure render
      setTimeout(() => {
          if (window.startTour) window.startTour();
      }, 500);
      // Clean up URL, keeping any filters
      urlParams.delete('tutorial');
      const search = urlParams.toString();
      window.history.replaceState(null, '', search ? `/?${search}` : '/');
    }

    return () => abortRef.current?.abort();
  }, []);


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCommune('');
    setKeywordQuery([]);
    setSelectedDependency('');
  };

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />

      <div className="container">
        <FilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            keywordQuery={keywordQuery}
            setKeywordQuery={setKeywordQuery}
            selectedCommune={selectedCommune}
            setSelectedCommune={setSelectedCommune}
            communesByRegion={communesByRegion}
            selectedDependency={selectedDependency}
            setSelectedDependency={setSelectedDependency}
            currency={currency}
            setCurrency={setCurrency}
            onCompareClick={() => setIsCompareOpen(true)}
        />

        <ComparisonModal
            isOpen={isCompareOpen}
            onClose={() => setIsCompareOpen(false)}
            currency={currency}
            rates={exchangeRates}
        />

        <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }} aria-live="polite">
            Mostrando <strong>{schools.length}</strong> de <strong>{total}</strong> colegios encontrados
            {isLoading && ' · Cargando…'}
        </div>

        {error && (
            <div style={{ marginBottom: '1rem', color: '#dc2626' }}>{error}</div>
        )}

        {schools.length > 0 ? (
            <>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', opacity: isLoading && page === 1 ? 0.6 : 1 }}>
                {schools.map(school => (
                    <SchoolCard key={school.id} school={school} currency={currency} rates={exchangeRates} />
                ))}
                </div>
                {page < totalPages && (
                    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <button
                            onClick={() => fetchPage(page + 1, { append: true })}
                            className="btn btn-outline"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Cargando…' : 'Cargar más colegios'}
                        </button>
                    </div>
                )}
            </>
        ) : !isLoading && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.2rem' }}>No se encontraron colegios con esos criterios.</p>
                <button
                    onClick={clearFilters}
                    className="btn btn-outline"
                    style={{ marginTop: '1rem' }}
                >
                    Limpiar filtros
                </button>
            </div>
        )}
      </div>
    </main>
  );
}
