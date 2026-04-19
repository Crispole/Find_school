import { X, School, ExternalLink, GraduationCap, BookOpen } from 'lucide-react';
import styles from './FeeModal.module.css';

export default function FeeModal({ isOpen, onClose, school }) {
  if (!isOpen) return null;

  const hasSimce = school.simce_math || school.simce_language;
  const hasPaes = school.paes_math || school.paes_language;
  const hasExtraPaes = school.paes_ptu_matematica2 || school.paes_ptu_historia || school.paes_ptu_ciencias;
  const hasResults = hasSimce || hasPaes || hasExtraPaes;

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
                    {(hasSimce || hasPaes) && (
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
                                            PAES (M1/L)
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
                    )}

                    <div className={styles.extraSection}>
                        <h3 className={styles.sectionTitle}>Otras Pruebas PAES</h3>
                        {hasExtraPaes ? (
                            <div className={styles.extraGrid}>
                                <div className={styles.extraItem}>
                                    <span className={styles.extraLabel}>Matemática 2 (M2)</span>
                                    <span className={styles.extraValue}>{school.paes_ptu_matematica2 || 'No registra'}</span>
                                </div>
                                <div className={styles.extraItem}>
                                    <span className={styles.extraLabel}>Historia y Cs. Soc.</span>
                                    <span className={styles.extraValue}>{school.paes_ptu_historia || 'No registra'}</span>
                                </div>
                                <div className={styles.extraItem}>
                                    <span className={styles.extraLabel}>Ciencias</span>
                                    <span className={styles.extraValue}>{school.paes_ptu_ciencias || 'No registra'}</span>
                                </div>
                            </div>
                        ) : (
                            <p className={styles.noExtraInfo}>
                                No hay información disponible de pruebas electivas (M2, Historia o Ciencias) para este establecimiento.
                            </p>
                        )}
                    </div>

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
