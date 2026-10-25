'use client';

import { useState, useEffect } from 'react';
import { X, Scale, Star, Users, MapPin, Globe, CreditCard, Phone } from 'lucide-react';
import styles from './ComparisonModal.module.css';
import { convertAndFormat } from '../utils/currency';
import { toExternalUrl, toMapsUrl } from '../utils/links';
import { formatPhone, toTelHref } from '../utils/phone';

const MIN_QUERY_LENGTH = 2;

// Search-as-you-type against /api/schools instead of a <select> with thousands of options
function SchoolPicker({ label, selected, onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({ q: query.trim(), pageSize: '8' });
        const res = await fetch(`/api/schools?${params}`, { signal: controller.signal });
        if (res.ok) setResults((await res.json()).items);
      } catch (e) {
        if (e.name !== 'AbortError') setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const choose = (school) => {
    onSelect(school);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className={styles.selectGroup}>
      <label className={styles.label}>{label}</label>
      <div className={styles.picker}>
        <input
          type="text"
          className={`${styles.select} ${styles.pickerInput}`}
          placeholder={selected ? selected.name : 'Escribe el nombre del colegio...'}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />
        {isOpen && query.trim().length >= MIN_QUERY_LENGTH && (
          <ul className={styles.results}>
            {isLoading && results.length === 0 && <li className={styles.resultHint}>Buscando…</li>}
            {!isLoading && results.length === 0 && <li className={styles.resultHint}>Sin resultados</li>}
            {results.map((school) => (
              <li key={school.id}>
                <button type="button" className={styles.resultItem} onMouseDown={() => choose(school)}>
                  <span>{school.name}</span>
                  <span className={styles.resultMeta}>{school.commune} · {school.dependency}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function ComparisonModal({ isOpen, onClose, currency, rates }) {
  const [school1, setSchool1] = useState(null);
  const [school2, setSchool2] = useState(null);

  if (!isOpen) return null;

  const features = [
    { label: 'Comuna', key: 'commune', icon: <MapPin size={16} /> },
    { label: 'Dependencia', key: 'dependency', icon: <Users size={16} /> },
    { label: 'Estudiantes', key: 'students', icon: <Users size={16} /> },
    { label: 'Calificación', key: 'rating', icon: <Star size={16} /> },
    { label: 'Matrícula', key: 'enrollment_fee', icon: <CreditCard size={16} />, isFee: true },
    { label: 'Mensualidad', key: 'monthly_fee', icon: <CreditCard size={16} />, isFee: true },
    { label: 'Dirección', key: 'address', icon: <MapPin size={16} /> },
    { label: 'Sitio Web', key: 'website', icon: <Globe size={16} /> },
    { label: 'Teléfono', key: 'phone', icon: <Phone size={16} /> },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>
            <Scale className="text-primary" />
            <h2>Comparar Colegios</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.selectionArea}>
            <SchoolPicker label="Colegio 1" selected={school1} onSelect={setSchool1} />
            <SchoolPicker label="Colegio 2" selected={school2} onSelect={setSchool2} />
          </div>

          {school1 && school2 ? (
            <div className={styles.comparisonTable}>
              {features.map(feature => {
                const renderValue = (school) => {
                  const value = school[feature.key];

                  if (feature.isFee) return convertAndFormat(value, currency, rates);

                  if (feature.key === 'address') {
                    return (
                      <a
                        href={toMapsUrl(school)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mapLink}
                      >
                        {value || 'Ver en mapa'}
                      </a>
                    );
                  }

                  if (value === null || value === undefined || value === '') return 'N/A';

                  if (feature.key === 'phone') {
                    const label = formatPhone(value);
                    return label ? <a href={toTelHref(value)} className={styles.mapLink}>{label}</a> : 'N/A';
                  }

                  if (feature.key === 'website') {
                    return (
                      <a
                        href={toExternalUrl(value)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mapLink}
                      >
                        {value}
                      </a>
                    );
                  }

                  return value;
                };

                return (
                  <div key={feature.key} className={styles.row}>
                    <div className={styles.featureLabel}>
                      {feature.icon}
                      <span style={{ marginLeft: '0.5rem' }}>{feature.label}</span>
                    </div>
                    <div className={styles.featureValue}>
                      {renderValue(school1)}
                    </div>
                    <div className={styles.featureValue}>
                      {renderValue(school2)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>Selecciona dos colegios para ver la comparativa detallada.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
