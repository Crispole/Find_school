'use client'; // Client component for interactivity
import { useState } from 'react';

import { Search, Scale, MapPin } from 'lucide-react';
import styles from './FilterBar.module.css';
import CurrencySwitcher from './CurrencySwitcher';

export default function FilterBar({ 
  searchQuery, setSearchQuery, 
  keywordQuery, setKeywordQuery, 
  selectedCommune, setSelectedCommune, 
  communesByRegion,
  selectedDependency, setSelectedDependency,
  currency, setCurrency,
  onCompareClick,
  view = 'lista', mapCommune = '', onMapSearch
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const keywords = ["Mixto", "Laico", "Católico", "Excelencia", "Bilingüe", "Gratuito", "Tradicional", "Familiar", "Inclusivo", "Integral", "Bicentenario", "Técnico Profesional", "Artístico"];

  const handleKeywordToggle = (keyword) => {
    if (keywordQuery.includes(keyword)) {
      setKeywordQuery(keywordQuery.filter(k => k !== keyword));
    } else {
      setKeywordQuery([...keywordQuery, keyword]);
    }
  };

  return (
    <div className={`${styles.container} ${view === 'mapa' ? styles.static : ''}`}>
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
  );
}
