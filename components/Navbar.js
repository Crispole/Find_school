import Link from 'next/link';
import { Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img 
            src="/img/logo-sin-fondo.webp" 
            alt="Logo" 
            className={styles.logoImage} 
          />
          <span className={styles.logoText}>Encuentra tu colegio</span>
        </Link>
        <div className={styles.navRight}>
          <ul className={styles.navLinks}>
            <li><Link href="/quienes-somos" className={styles.navLink}>Quienes somos</Link></li>
            <li>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  if (window.location.pathname === '/') {
                    if (typeof window !== 'undefined' && window.startTour) {
                      window.startTour();
                    }
                  } else {
                    window.location.href = '/?tutorial=true';
                  }
                }} 
                className={styles.navLink}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'inherit' }}
              >
                Cómo funciona
              </button>
            </li>
            <li><Link href="/contacto" className={styles.navLink}>Contacto</Link></li>
          </ul>
          <button 
            className={styles.themeToggle} 
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
