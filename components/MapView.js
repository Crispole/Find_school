'use client';

import { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import FeeModal from './FeeModal';
import { DEPENDENCY_COLORS, getDependencyColor } from '../utils/dependency';
import { convertAndFormat } from '../utils/currency';
import styles from './MapView.module.css';

// Leaflet only works in the browser; this also keeps it out of the list view's bundle
const SchoolMap = dynamic(() => import('./SchoolMap'), {
  ssr: false,
  loading: () => <div className={styles.mapPlaceholder}>Cargando mapa…</div>,
});

function SchoolListItem({ school, isActive, currency, rates, onHover, onClick, itemRef }) {
  return (
    <li
      ref={itemRef}
      className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
      onMouseEnter={() => onHover?.(school.id)}
      onMouseLeave={() => onHover?.(null)}
    >
      <button type="button" className={styles.itemButton} onClick={() => onClick(school)}>
        <span className={styles.itemHeader}>
          <span className={styles.dot} style={{ background: getDependencyColor(school.dependency) }} />
          <span className={styles.itemName}>{school.name}</span>
        </span>
        <span className={styles.itemMeta}>
          {school.dependency || 'Dependencia s/i'} · Mensualidad: {convertAndFormat(school.monthly_fee, currency, rates)}
        </span>
        {(school.simce_math || school.simce_language) && (
          <span className={styles.itemMeta}>
            SIMCE Mat {school.simce_math ?? '-'} · Len {school.simce_language ?? '-'}
          </span>
        )}
      </button>
    </li>
  );
}

export default function MapView({ commune, data, isLoading, error, theme, currency, rates }) {
  const [hoveredId, setHoveredId] = useState(null);
  // `fromMap`: picked by clicking its marker, so the map should not fly to it
  const [selection, setSelection] = useState({ id: null, fromMap: false });
  const [mobileTab, setMobileTab] = useState('map');
  const [resultsSchool, setResultsSchool] = useState(null);
  const itemRefs = useRef(new Map());

  if (!commune) {
    return (
      <div className={styles.prompt}>
        <MapPin size={32} />
        <p>Elige una comuna y presiona <strong>Buscar en mapa</strong> para ver todos sus colegios.</p>
      </div>
    );
  }

  if (error) return <div className={styles.prompt}>{error}</div>;
  if (!data) return <div className={styles.prompt}>Cargando colegios de {commune}…</div>;

  const { located, withoutLocation, total } = data;

  // From the map: highlight the school in the list. From the list: fly to it on the map.
  const selectSchool = (id, fromMap = false) => {
    setSelection({ id, fromMap });
    if (fromMap) itemRefs.current.get(id)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };

  const handleListClick = (school) => {
    if (Number.isFinite(school.lat)) {
      selectSchool(school.id);
      setMobileTab('map');
    } else {
      setResultsSchool(school);
    }
  };

  const setItemRef = (id) => (node) => {
    if (node) itemRefs.current.set(id, node);
    else itemRefs.current.delete(id);
  };

  return (
    <section className={styles.wrapper} style={{ opacity: isLoading ? 0.6 : 1 }}>
      <div className={styles.summary}>
        <span>
          <strong>{total}</strong> colegios en <strong>{commune}</strong>
          {withoutLocation.length > 0 && ` · ${located.length} en el mapa`}
          {isLoading && ' · Actualizando…'}
        </span>
        <ul className={styles.legend}>
          {DEPENDENCY_COLORS.map(({ dependency, label, color }) => (
            <li key={dependency}><span className={styles.dot} style={{ background: color }} />{label}</li>
          ))}
        </ul>
      </div>

      <div className={styles.tabs} role="tablist">
        <button type="button" role="tab" aria-selected={mobileTab === 'map'} className={mobileTab === 'map' ? styles.tabActive : ''} onClick={() => setMobileTab('map')}>
          Mapa
        </button>
        <button type="button" role="tab" aria-selected={mobileTab === 'list'} className={mobileTab === 'list' ? styles.tabActive : ''} onClick={() => setMobileTab('list')}>
          Lista ({total})
        </button>
      </div>

      <div className={styles.layout} data-tab={mobileTab}>
        <aside className={styles.list}>
          {total === 0 && <p className={styles.empty}>No hay colegios con estos filtros en {commune}.</p>}
          <ul>
            {located.map((school) => (
              <SchoolListItem
                key={school.id}
                school={school}
                isActive={school.id === hoveredId || school.id === selection.id}
                currency={currency}
                rates={rates}
                onHover={setHoveredId}
                onClick={handleListClick}
                itemRef={setItemRef(school.id)}
              />
            ))}
          </ul>
          {withoutLocation.length > 0 && (
            <>
              <h4 className={styles.listTitle}>Sin ubicación en el mapa ({withoutLocation.length})</h4>
              <ul>
                {withoutLocation.map((school) => (
                  <SchoolListItem key={school.id} school={school} currency={currency} rates={rates} onClick={handleListClick} />
                ))}
              </ul>
            </>
          )}
        </aside>

        <div className={styles.mapWrapper}>
          {located.length > 0 ? (
            <SchoolMap
              schools={located}
              theme={theme}
              hoveredId={hoveredId}
              selectedId={selection.id}
              flyToSelected={!selection.fromMap}
              onSelect={selectSchool}
              onOpenResults={setResultsSchool}
              currency={currency}
              rates={rates}
            />
          ) : (
            <div className={styles.mapPlaceholder}>
              {total > 0 ? 'Aún no hay ubicaciones cargadas para los colegios de esta comuna.' : 'Sin colegios para mostrar.'}
            </div>
          )}
        </div>
      </div>

      {resultsSchool && (
        <FeeModal isOpen onClose={() => setResultsSchool(null)} school={resultsSchool} />
      )}
    </section>
  );
}
