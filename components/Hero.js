import { GraduationCap, Sun, Moon } from 'lucide-react';
import styles from './Hero.module.css';

export default function Hero({ theme, toggleTheme }) {
  return (
    <section className={styles.hero}>
      <button 
        className={styles.themeToggle} 
        onClick={toggleTheme}
        aria-label="Toggle Theme"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <div className={styles.container}>
        <div className={styles.badge}>
            <GraduationCap size={20} className={styles.badgeIcon} />
            <span className={styles.badgeText}>Educación de Excelencia en Santiago</span>
        </div>
        <h1 className={styles.title}>Encuentra el colegio ideal para tus hijas e hijos</h1>
        <p className={styles.description}>
          Explora los mejores establecimientos educacionales de Providencia, Ñuñoa, Santiago, Las Condes,  y más. 
          Información detallada sobre aranceles, dependencia y opiniones reales.
        </p>
      </div>
    </section>
  );
}
