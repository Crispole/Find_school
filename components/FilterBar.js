'use client'; // Client component for interactivity
import { useState } from 'react';

import { Search, Scale, MapPin, SlidersHorizontal } from 'lucide-react';
import styles from './FilterBar.module.css';
import CurrencySwitcher from './CurrencySwitcher';
import { MAX_SCORE, SCORE_METRICS, parseMinScore } from '../utils/scores';

const DEPENDENCY_OPTIONS = [
  { value: '', label: 'Todos los establecimientos' },
  { value: 'Municipal', label: 'Municipales' },
  { value: 'Particular Subvencionado', label: 'Subvencionados' },
  { value: 'Particular Pagado', label: 'Particulares' },
  { value: 'Corporación de Administración Delegada', label: 'Adm. Delegada' },
];

// <optgroup> sections of the score select, in the order of SCORE_METRICS
const SCORE_GROUPS = SCORE_METRICS.reduce((groups, metric) => {
  const last = groups[groups.length - 1];
  if (last?.group === metric.group) last.metrics.push(metric);
  else groups.push({ group: metric.group, metrics: [metric] });
  return groups;
}, []);

export default function FilterBar({ 
  searchQuery, setSearchQuery, 
  keywordQuery, setKeywordQuery, 
  selectedCommune, setSelectedCommune, 
  communesByRegion,
  selectedDependency, setSelectedDependency,
  scoreMetric = '', setScoreMetric,
  minScore = '', setMinScore,
  currency, setCurrency,
  onCompareClick,
  view = 'lista', mapCommune = '', onMapSearch
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // The map view needs the commune picker in sight, so only the list view folds
  const collapsible = view === 'lista';
  const activeFilters =
    (keywordQuery.length > 0 ? 1 : 0) +
    (selectedCommune ? 1 : 0) +
    (selectedDependency ? 1 : 0) +
    (scoreMetric && minScore ? 1 : 0);
  const keywords = ["Mixto", "Laico", "Católico", "Excelencia", "Bilingüe", "Gratuito", "Tradicional", "Familiar", "Inclusivo", "Integral", "Bicentenario", "Técnico Profesional", "Artístico"];

  const handleKeywordToggle = (keyword) => {
    if (keywordQuery.includes(keyword)) {
      setKeywordQuery(keywordQuery.filter(k => k !== keyword));
    } else {
      setKeywordQuery([...keywordQuery, keyword]);
    }
  };

  return (
    <div className={`${styles.container} ${view === 'mapa' ? styles.static : ''} ${collapsible && isPanelOpen ? styles.containerOpen : ''}`}>
      {/* 1. Search by Name (list view only; the map shows a whole commune) */}
      {view === 'lista' && (
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
              style={{ paddingRight: '1rem' }}
          />
        </div>
      )}

      {/* Phones, list view: the other controls fold behind this button to keep the sticky bar short */}
      {collapsible && (
        <button
          type="button"
          className={`${styles.filtersToggle} ${isPanelOpen ? styles.filtersToggleOpen : ''}`}
          onClick={() => setIsPanelOpen((open) => !open)}
          aria-expanded={isPanelOpen}
          aria-controls="filter-panel"
        >
          <SlidersHorizontal size={18} />
          <span>Filtros</span>
          {activeFilters > 0 && <span className={styles.filtersBadge}>{activeFilters}</span>}
        </button>
      )}

      {/* On desktop the panel is transparent to layout (display: contents) */}
      <div id="filter-panel" className={`${styles.panel} ${collapsible && !isPanelOpen ? styles.panelCollapsed : ''}`}>
      {/* 2. Search by Project (Keywords Checkboxes) */}
      <div className={styles.dropdownWrapper}>
        <button 
          className={styles.dropdownTrigger}
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          type="button"
        >
          <Search size={20} className={styles.searchIcon} />
          <span className={styles.triggerText}>
            {keywordQuery.length > 0 
              ? `${keywordQuery.length} seleccionados` 
              : "Proyecto educativo..."}
          </span>
        </button>
        
        {isDropdownOpen && (
          <div className={styles.dropdownMenu}>
            {keywords.map(keyword => (
              <label key={keyword} className={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  checked={keywordQuery.includes(keyword)}
                  onChange={() => handleKeywordToggle(keyword)}
                  className={styles.checkbox}
                />
                <span>{keyword}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 3. Commune Selection */}
      <select 
        value={selectedCommune} 
        onChange={(e) => setSelectedCommune(e.target.value)}
        className={styles.select}
      >
        <option value="">{view === 'mapa' ? 'Elige una comuna...' : 'Todas las comunas'}</option>
        {communesByRegion.map(({ region, communes }) => (
            <optgroup key={region} label={region}>
                {communes.map(commune => (
                    <option key={commune} value={commune}>{commune}</option>
                ))}
            </optgroup>
        ))}
      </select>

      {/* 3.5 Map search: runs once a commune is picked */}
      {view === 'mapa' && (
        <button
          type="button"
          className={`${styles.mapSearchBtn} ${selectedCommune && selectedCommune !== mapCommune ? styles.mapSearchPending : ''}`}
          onClick={onMapSearch}
          disabled={!selectedCommune}
          title={selectedCommune ? `Ver colegios de ${selectedCommune} en el mapa` : 'Primero elige una comuna'}
        >
          <MapPin size={18} />
          <span>Buscar en mapa</span>
        </button>
      )}

      {/* 4. Dependency Switcher */}
      <div className={styles.filterGroup} id="tour-filters">
        {/* Phones: one select instead of the row of buttons */}
        <select
          value={selectedDependency}
          onChange={(e) => setSelectedDependency(e.target.value)}
          className={`${styles.select} ${styles.dependencySelect}`}
          aria-label="Tipo de establecimiento"
        >
          {DEPENDENCY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>

        <div className={styles.toggleGroup}>
          <button 
            className={`${styles.toggleBtn} ${!selectedDependency ? styles.active : ''}`}
            onClick={() => setSelectedDependency('')}
          >
            Todos
          </button>
          <button 
            className={`${styles.toggleBtn} ${selectedDependency === 'Municipal' ? styles.active : ''}`}
            onClick={() => setSelectedDependency('Municipal')}
          >
            Municipales
          </button>
          <button 
            className={`${styles.toggleBtn} ${selectedDependency === 'Particular Subvencionado' ? styles.active : ''}`}
            onClick={() => setSelectedDependency('Particular Subvencionado')}
          >
            Subvencionados
          </button>
          <button 
            className={`${styles.toggleBtn} ${selectedDependency === 'Particular Pagado' ? styles.active : ''}`}
            onClick={() => setSelectedDependency('Particular Pagado')}
          >
            Particulares
          </button>
          <button
            className={`${styles.toggleBtn} ${selectedDependency === 'Corporación de Administración Delegada' ? styles.active : ''}`}
            onClick={() => setSelectedDependency('Corporación de Administración Delegada')}
          >
            Adm. Delegada
          </button>
        </div>
      </div>

      {/* 4.2 Score filter: a test plus a minimum score */}
      <div className={styles.scoreGroup} id="tour-score">
        <select
          value={scoreMetric}
          onChange={(e) => setScoreMetric(e.target.value)}
          className={`${styles.select} ${styles.scoreSelect}`}
          aria-label="Filtrar por prueba"
        >
          <option value="">Filtrar por puntaje…</option>
          {SCORE_GROUPS.map(({ group, metrics }) => (
            <optgroup key={group} label={group}>
              {metrics.map(({ slug, label }) => (
                <option key={slug} value={slug}>{group} · {label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <input
          type="number"
          inputMode="numeric"
          min="1"
          max={MAX_SCORE}
          placeholder="Mínimo"
          value={minScore}
          disabled={!scoreMetric}
          onChange={(e) => setMinScore(parseMinScore(e.target.value))}
          className={styles.scoreInput}
          aria-label="Puntaje mínimo"
        />
      </div>

      {scoreMetric && minScore ? (
        <p className={styles.scoreHint} role="note">
          Se muestran solo colegios con puntaje registrado igual o superior a {minScore}; los que no tienen dato en esa
          prueba quedan fuera. Los puntajes no miden por sí solos la calidad de un colegio.
        </p>
      ) : null}

      {/* 4.5 Comparison Button */}
      <button className={styles.compareBtn} onClick={onCompareClick} id="tour-compare">
        <Scale size={18} />
        <span>Compara</span>
      </button>

      {/* 5. Currency Switcher */}
      <div id="tour-currency">
        <CurrencySwitcher currentCurrency={currency} setCurrency={setCurrency} />
      </div>
      </div>
    </div>
  );
}
