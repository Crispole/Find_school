'use client'; // Client component for interactivity
import { useState, useEffect } from 'react';

import { Search, Scale } from 'lucide-react';
import styles from './FilterBar.module.css';
import CurrencySwitcher from './CurrencySwitcher';

export default function FilterBar({ 
  searchQuery, setSearchQuery, 
  keywordQuery, setKeywordQuery, 
  selectedCommune, setSelectedCommune, 
  communes, 
  selectedDependency, setSelectedDependency,
  currency, setCurrency,
  onCompareClick
}) {
  return (
    <div className={styles.container}>
      {/* 1. Search by Name */}
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

      {/* 2. Search by Project (Keywords) */}
      <div className={styles.searchWrapper}>
        <Search size={20} className={styles.searchIcon} />
        <input 
            type="text" 
            placeholder="Proyecto educativo..." 
            value={keywordQuery}
            onChange={(e) => setKeywordQuery(e.target.value)}
            className={styles.searchInput}
            style={{ paddingRight: '1rem' }}
            list="keyword-suggestions"
        />
        <datalist id="keyword-suggestions">
          <option value="Mixto" />
          <option value="Laico" />
          <option value="Católico" />
          <option value="Excelencia" />
          <option value="Bilingüe" />
          <option value="Inglés" />
        </datalist>
      </div>

      {/* 3. Commune Selection */}
      <select 
        value={selectedCommune} 
        onChange={(e) => setSelectedCommune(e.target.value)}
        className={styles.select}
      >
        <option value="">Todas las comunas</option>
        {communes.map(commune => (
            <option key={commune} value={commune}>{commune}</option>
        ))}
      </select>
      
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
