import { X, School, ExternalLink, GraduationCap, BookOpen } from 'lucide-react';
import styles from './FeeModal.module.css';

export default function FeeModal({ isOpen, onClose, school }) {
  if (!isOpen) return null;

  const hasSimce = school.simce_math || school.simce_language;
  const hasPaes = school.paes_math || school.paes_language;
  const hasResults = hasSimce || hasPaes;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
            <X size={24} />
        </button>
        
        <h2 className={styles.title}>Resultados Académicos</h2>
        <div className={styles.subtitle}>
            <School size={16} />
            <span>{school.name}</span>
        </div>

        <div className={styles.contentWrapper}>
            {hasResults ? (
                <>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Evaluación</th>
                                <th style={{ textAlign: 'center' }}>Matemática</th>
                                <th style={{ textAlign: 'center' }}>Lenguaje</th>
                            </tr>
                        </thead>
                        <tbody>
                            {hasSimce && (
                                <tr>
                                    <td className={styles.levelColumn}>
                                        <BookOpen size={16} />
                                        SIMCE
                                    </td>
                                    <td className={styles.valueColumn}>
                                        {school.simce_math || '-'}
                                    </td>
                                    <td className={styles.valueColumn}>
                                        {school.simce_language || '-'}
                                    </td>
                                </tr>
                            )}
                            {hasPaes && (
                                <tr>
                                    <td className={styles.levelColumn}>
                                        <GraduationCap size={16} />
                                        PAES
                                    </td>
                                    <td className={styles.valueColumn}>
                                        {school.paes_math || '-'}
                                    </td>
                                    <td className={styles.valueColumn}>
                                        {school.paes_language || '-'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <div className={styles.disclaimer}>
                        * Puntajes promedio registrados.
                        <br />
                        * SIMCE 2024 y PAES 2025
                    </div>
                </>
            ) : (
                <div className={styles.noResults}>
                    <p className={styles.noResultsText}>
                        No hay resultados registrados en nuestra base de datos para este establecimiento.
                    </p>
                    <p className={styles.noResultsSub}>
                        Puedes consultar directamente en las fuentes oficiales:
                    </p>
                    
                    <a 
                        href="https://www.agenciaeducacion.cl/simce/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.officialLink}
                    >
                        <BookOpen size={16} />
                        Resultados SIMCE
                        <ExternalLink size={14} />
                    </a>

                    <a 
                        href="https://colegios.demre.cl/estadistica-resultados-puntajes" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.officialLink}
                    >
                        <GraduationCap size={16} />
                        Resultados PAES
                        <ExternalLink size={14} />
                    </a>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
