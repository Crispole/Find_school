'use client';

import { useState } from 'react';
import { X, Scale, Star, Users, MapPin, Globe, CreditCard } from 'lucide-react';
import styles from './ComparisonModal.module.css';

export default function ComparisonModal({ isOpen, onClose, schools }) {
  const [school1Id, setSchool1Id] = useState('');
  const [school2Id, setSchool2Id] = useState('');

  if (!isOpen) return null;

  const school1 = schools.find(s => s.id.toString() === school1Id.toString());
  const school2 = schools.find(s => s.id.toString() === school2Id.toString());

  const sortedSchools = [...schools].sort((a, b) => a.name.localeCompare(b.name));

  const features = [
    { label: 'Comuna', key: 'commune', icon: <MapPin size={16} /> },
    { label: 'Dependencia', key: 'dependency', icon: <Users size={16} /> },
    { label: 'Estudiantes', key: 'students', icon: <Users size={16} /> },
    { label: 'Calificación', key: 'rating', icon: <Star size={16} /> },
    { label: 'Matrícula', key: 'enrollment_fee', icon: <CreditCard size={16} /> },
    { label: 'Mensualidad', key: 'monthly_fee', icon: <CreditCard size={16} /> },
    { label: 'Dirección', key: 'address', icon: <MapPin size={16} /> },
    { label: 'Sitio Web', key: 'website', icon: <Globe size={16} /> },
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
            <div className={styles.selectGroup}>
              <label className={styles.label}>Colegio 1</label>
              <select 
                className={styles.select} 
                value={school1Id} 
                onChange={e => setSchool1Id(e.target.value)}
              >
                <option value="">Seleccionar colegio...</option>
                {sortedSchools.map(s => (
                  <option key={`s1-${s.id}`} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.selectGroup}>
              <label className={styles.label}>Colegio 2</label>
              <select 
                className={styles.select} 
                value={school2Id} 
                onChange={e => setSchool2Id(e.target.value)}
              >
                <option value="">Seleccionar colegio...</option>
                {sortedSchools.map(s => (
                  <option key={`s2-${s.id}`} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {school1 && school2 ? (
            <div className={styles.comparisonTable}>
              {features.map(feature => (
                <div key={feature.key} className={styles.row}>
                  <div className={styles.featureLabel}>
                    {feature.icon}
                    <span style={{ marginLeft: '0.5rem' }}>{feature.label}</span>
                  </div>
                  <div className={styles.featureValue}>{school1[feature.key] || 'N/A'}</div>
                  <div className={styles.featureValue}>{school2[feature.key] || 'N/A'}</div>
                </div>
              ))}
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
