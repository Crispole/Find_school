'use client';

// Leaflet touches `window`, so this file is only loaded in the browser
// (MapView imports it with next/dynamic and ssr: false).
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDependencyColor } from '../utils/dependency';
import { convertAndFormat } from '../utils/currency';
import styles from './MapView.module.css';

const SANTIAGO = [-33.45, -70.66];

// OpenStreetMap tiles: free and without API key (the attribution is required).
// Dark mode darkens them with a CSS filter (see .mapDark in MapView.module.css).
const TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// Zooms the map to show every school of the current search
function FitToSchools({ schools }) {
  const map = useMap();
  useEffect(() => {
    if (schools.length === 0) return;
    if (schools.length === 1) {
      map.setView([schools[0].lat, schools[0].lng], 16);
    } else {
      map.fitBounds(schools.map((s) => [s.lat, s.lng]), { padding: [40, 40], maxZoom: 16 });
    }
  }, [map, schools]);
  return null;
}

// Flies to the school picked in the list and opens its popup
function FocusSelected({ school, markersRef }) {
  const map = useMap();
  useEffect(() => {
    if (!school) return;
    map.flyTo([school.lat, school.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
    markersRef.current.get(school.id)?.openPopup();
  }, [map, school, markersRef]);
  return null;
}

export default function SchoolMap({ schools, theme, hoveredId, selectedId, flyToSelected, onSelect, onOpenResults, currency, rates }) {
  const markersRef = useRef(new Map());
  const selected = schools.find((s) => s.id === selectedId) || null;

  useEffect(() => {
    markersRef.current.get(hoveredId)?.bringToFront();
  }, [hoveredId]);

  return (
    <MapContainer center={SANTIAGO} zoom={12} scrollWheelZoom className={`${styles.map} ${theme === 'dark' ? styles.mapDark : ''}`}>
      <TileLayer url={TILE_URL} attribution={ATTRIBUTION} maxZoom={19} />
      <FitToSchools schools={schools} />
      <FocusSelected school={flyToSelected ? selected : null} markersRef={markersRef} />

      {schools.map((school) => {
        const isActive = school.id === hoveredId || school.id === selectedId;
        return (
          <CircleMarker
            key={school.id}
            center={[school.lat, school.lng]}
            radius={isActive ? 12 : 8}
            pathOptions={{
              color: '#ffffff',
              weight: 2,
              fillColor: getDependencyColor(school.dependency),
              fillOpacity: isActive ? 1 : 0.85,
            }}
            ref={(marker) => {
              if (marker) markersRef.current.set(school.id, marker);
              else markersRef.current.delete(school.id);
            }}
            eventHandlers={{ click: () => onSelect(school.id, true) }}
          >
            <Popup>
              <div className={styles.popup}>
                <strong className={styles.popupName}>{school.name}</strong>
                <span className={styles.popupMeta}>{school.dependency}</span>
                <dl className={styles.popupStats}>
                  <div>
                    <dt>Mensualidad</dt>
                    <dd>{convertAndFormat(school.monthly_fee, currency, rates)}</dd>
                  </div>
                  <div>
                    <dt>SIMCE Mat / Len</dt>
                    <dd>{school.simce_math ?? '-'} / {school.simce_language ?? '-'}</dd>
                  </div>
                </dl>
                <div className={styles.popupActions}>
                  <button type="button" onClick={() => onOpenResults(school)}>Ver resultados</button>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${school.lat},${school.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Cómo llegar
                  </a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
