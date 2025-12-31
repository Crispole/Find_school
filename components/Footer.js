import styles from './Footer.module.css';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.content}>
          <p className={styles.text}>
            Creado por <span className={styles.name}>Cristián Pozo Labbé</span> y <span className={styles.name}>Karina Guajardo Carrasco</span>
          </p>
          <div className={styles.iconWrapper}>
             <Heart size={16} fill="var(--primary)" color="var(--primary)" />
          </div>
        </div>
        
        <div className={styles.linksSection}>
            <h4 className={styles.linksTitle}>Páginas de Interés</h4>
            <div className={styles.linksGrid}>
                <a href="https://www.agenciaeducacion.cl/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>Agencia de Calidad de la Educación</a>
                <a href="https://demre.cl/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>DEMRE</a>
                <a href="https://centroestudios.mineduc.cl/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>Centro de Estudios Mineduc</a>
                <a href="https://eligeeducar.cl/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>Elige Educar</a>
                <a href="https://convivenciadigital.cl/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>Convivencia Digital</a>
                <a href="https://www.curriculumnacional.cl/" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>Currículum Nacional</a>
                <a href="https://mi.mineduc.cl/mvc/mime/portada" target="_blank" rel="noopener noreferrer" className={styles.linkItem}>MI Mineduc</a>
            </div>
        </div>
      </div>
    </footer>
  );
}
