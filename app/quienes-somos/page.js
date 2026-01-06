'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import styles from './QuienesSomos.module.css';

export default function QuienesSomos() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <main className={styles.mainContainer}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      {/* 1. Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1 className={styles.heroTitle}>
            La decisión educativa más importante, respaldada por datos profundos.
          </h1>
          <p className={styles.heroSubtitle}>
            Explora, compara y conecta con una red de más de 500 colegios de la Región Metropolitana. 
            Información transparente creada por expertos en economía y educación.
          </p>
          <div className={styles.heroButtons}>
            <Link href="/" className="btn btn-primary">Buscar Colegio</Link>
          </div>
        </div>
      </section>

      {/* 2. Quiénes Somos: La Visión "Deep Well" */}
      <section className={styles.section + ' ' + styles.vision}>
        <div className={styles.container}>
          <div className={styles.visionContent}>
            <div className={styles.visionText}>
              <h2>Quiénes Somos: La Visión "Deep Well"</h2>
              <p>
                En un mar de información dispersa, <strong>Deep Well</strong> nace para ofrecer profundidad y claridad. 
                Somos una plataforma que une dos mundos necesarios: la analítica de datos y la realidad pedagógica.
              </p>
              <p>
                Nuestra misión es democratizar el acceso a la información de los colegios en la Región Metropolitana, 
                entregando métricas claras para los padres y gestores de manera eficiente.
              </p>
              <p>
                No somos solo un buscador; somos el punto de encuentro entre la eficiencia económica y la calidad educativa.
              </p>
            </div>
            <div className={styles.visionDecoration}>
              {/* Optional: Add an image or graphic here */}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Nuestros Fundadores: El equilibrio perfecto */}
      <section className={styles.section + ' ' + styles.founders}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Nuestros Fundadores: El equilibrio perfecto</h2>
            <p style={{ maxWidth: '700px', margin: '0 auto' }}>
              Para que una plataforma de datos escolares funcione, necesitas a alguien que entienda los números y a alguien que entienda a las personas dentro del aula.
            </p>
          </div>
          
          <div className={styles.foundersGrid}>
            <div className={styles.founderCard}>
              <div className={styles.founderHeader}>
                <h3 className={styles.founderName}>Diego</h3>
                <span className={styles.founderRole}>Director de Análisis y Datos</span>
                <span className={styles.founderTitle}>Ingeniero Comercial | Máster en Economía y Políticas Públicas</span>
              </div>
              <p className={styles.founderQuote}>
                "Transformando datos complejos en decisiones claras para las familias."
              </p>
              <p className={styles.founderBio}>
                Con su experiencia en políticas públicas y sector bancario, Diego garantiza que la información que encuentres en Deep Well sea precisa, relevante y estructuralmente sólida. Su obsesión por el control de gestión asegura que los datos comparativos de los colegios (aranceles, rendimiento, ubicación) sean tratados con el rigor de un analista financiero, brindando transparencia al mercado educativo de la RM.
              </p>
            </div>

            <div className={styles.founderCard}>
              <div className={styles.founderHeader}>
                <h3 className={styles.founderName}>Cristián</h3>
                <span className={styles.founderRole}>Director de Comunidad y Tecnología</span>
                <span className={styles.founderTitle}>Profesor y Especialista en EdTech</span>
              </div>
              <p className={styles.founderQuote}>
                "La tecnología debe servir para conectar y enriquecer la experiencia educativa."
              </p>
              <p className={styles.founderBio}>
                Cristián conoce el sistema por dentro. Con más de 10 años en aulas (realizando clases en todos los niveles educativos, en sistemas municipales y privados), él sabe lo que realmente importa al elegir un colegio más allá de los números. Su dominio en programación y tecnología permite que esta plataforma sea humana, intuitiva y realmente útil para las necesidades del día a día de la comunidad escolar.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ¿Qué datos encontrarás en Deep Well? */}
      <section className={styles.section + ' ' + styles.features}>
        <div className={styles.container}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>¿Qué datos encontrarás en Deep Well?</h2>
            <p style={{ maxWidth: '800px', margin: '0 auto' }}>
              Hemos centralizado y procesado la información pública y privada de los establecimientos de la Región Metropolitana para ofrecerte un panorama claro y objetivo.
            </p>
          </div>

          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📊</span>
              <h3>Transparencia Económica</h3>
              <p>Sabemos que la planificación financiera es clave. Accede a información actualizada sobre los costos de:</p>
              <ul className={styles.featureList}>
                <li>Valores de matrícula anual (sugeto a disponibilidad).</li>
                <li>Aranceles mensuales y costos de incorporación (sugeto a disponibilidad).</li>
                <li>Comparativas de costos entre establecimientos similares.</li>
              </ul>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>📈</span>
              <h3>Métricas de Calidad Académica</h3>
              <p>Rendimiento actual de cada colegio con el rigor de nuestra base de datos.</p>
              <ul className={styles.featureList}>
                <li>Resultados SIMCE: Desglose por colegios del último SIMCE realizado.</li>
                <li>Resultados PAES: Desglose por colegio de la última PAES realziada  .</li>
              </ul>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🏫</span>
              <h3>Realidad y Entorno Escolar</h3>
              <p>Gracias a nuestra visión docente interna, destacamos datos que afectan la convivencia y la calidad del aula.</p>
              <ul className={styles.featureList}>
                <li>Densidad Estudiantil: Alumnos por establecimiento.</li>
                <li>Relación de infraestructura y matrícula.</li>
                <li>Tipo de dependencia y proyecto educativo.</li>
              </ul>
            </div>

            <div className={styles.featureCard}>
              <span className={styles.featureIcon}>🔍</span>
              <h3>El Comparador Deep Well</h3>
              <p>Herramienta tecnológica para contrastar puntos clave en una sola tabla fácil de leer.</p>
              <ul className={styles.featureList}>
                <li>Dinero / Rendimiento.</li>
                <li>Cantidad de Alumnos / Infraestructura.</li>
                <li>Diseñado para padres que buscan objetividad.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Call to Action */}
      <section className={styles.section + ' ' + styles.cta}>
        <div className={styles.container}>
          <h2>"Datos precisos para decisiones que marcan vidas."</h2>
          <p>
            Deja de navegar a ciegas. Utiliza la potencia del análisis de datos de Deep Well para encontrar el colegio que mejor se ajusta a las necesidades académicas de tus hijos y a la realidad económica de tu familia.
          </p>
          <Link href="/" className={"btn " + styles.ctaButton}>Empezar Búsqueda Ahora</Link>
        </div>
      </section>
    </main>
  );
}
