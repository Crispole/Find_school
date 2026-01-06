import Link from 'next/link';
import { School, Sun, Moon } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar({ theme, toggleTheme }) {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <School className={styles.logoIcon} size={24} />
          <span className={styles.logoText}>Encuentra tu colegio</span>
        </Link>
        <div className={styles.navRight}>
          <ul className={styles.navLinks}>
            <li><Link href="/quienes-somos" className={styles.navLink}>Quienes somos</Link></li>
            <li><Link href="/#como-funciona" className={styles.navLink}>Cómo funciona</Link></li>
            <li><Link href="/#contacto" className={styles.navLink}>Contacto</Link></li>
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
