import { X, School } from 'lucide-react';
import styles from './FeeModal.module.css';
import { convertAndFormat } from '../utils/currency';

export default function FeeModal({ isOpen, onClose, school, currency, rates }) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
        </button>
        
        <h2 className={styles.title}>Detalle de Aranceles</h2>
        <div className={styles.subtitle}>
            <School size={16} />
            <span>{school.name}</span>
        </div>

        <table className={styles.table}>
            <thead>
                <tr>
                    <th>Nivel Educativo</th>
                    <th style={{ textAlign: 'right' }}>Mensualidad Est.</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className={styles.levelColumn}>Educación Parvularia</td>
                    <td className={styles.valueColumn}>
                        {convertAndFormat(school.tuition_details?.pre_kinder || school.monthly_fee, currency, rates)}
                    </td>
                </tr>
                <tr>
                    <td className={styles.levelColumn}>Educación Básica</td>
                    <td className={styles.valueColumn}>
                        {convertAndFormat(school.tuition_details?.primary || school.monthly_fee, currency, rates)}
                    </td>
                </tr>
                <tr>
                    <td className={styles.levelColumn}>Educación Media</td>
                    <td className={styles.valueColumn}>
                        {convertAndFormat(school.tuition_details?.secondary || school.monthly_fee, currency, rates)}
                    </td>
                </tr>
            </tbody>
        </table>
        
        <div style={{ marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            * Valores referenciales sujetos a confirmación con el establecimiento.
        </div>
      </div>
    </div>
  );
}
