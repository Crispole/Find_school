'use client';

import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import styles from './Contacto.module.css';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contacto() {
  const [theme, setTheme] = useState('light');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setHasSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Reset success message after 5 seconds
      setTimeout(() => setHasSubmitted(false), 5000);
    }, 1500);
  };

  return (
    <main className={styles.mainContainer}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Hablemos</h1>
          <p className={styles.subtitle}>
            ¿Tienes alguna duda sobre un colegio? ¿Sugerencias para mejorar la plataforma? 
            Estamos aquí para escucharte.
          </p>
        </div>

        <div className={styles.content}>
          {/* Information Side */}
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <Mail className={styles.infoIcon} size={24} />
              <div>
                <span className={styles.infoLabel}>Email</span>
                <span className={styles.infoValue}>contacto@deepwell.cl</span>
                <span className={styles.infoValue} style={{ display: 'block', fontSize: '0.9em' }}>soporte@deepwell.cl</span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <MapPin className={styles.infoIcon} size={24} />
              <div>
                <span className={styles.infoLabel}>Ubicación</span>
                <span className={styles.infoValue}>
                  Providencia, Santiago<br />
                  Región Metropolitana, Chile
                </span>
              </div>
            </div>

            <div className={styles.infoItem}>
              <Phone className={styles.infoIcon} size={24} />
              <div>
                <span className={styles.infoLabel}>Horario de Atención</span>
                <span className={styles.infoValue}>
                  Lunes a Viernes<br />
                  9:00 AM - 6:00 PM
                </span>
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(37, 99, 235, 0.05)', borderRadius: 'var(--radius)' }}>
              <h4 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>Para Colegios</h4>
              <p style={{ fontSize: '0.95rem', margin: 0 }}>
                ¿Quieres actualizar la información de tu establecimiento o destacarlo en nuestra plataforma? Escríbenos con el asunto "Gestión Colegio".
              </p>
            </div>
          </div>

          {/* Form Side */}
          <div className={styles.formSection}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Nombre Completo</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className={styles.input} 
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Correo Electrónico</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className={styles.input} 
                  required 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="juan@ejemplo.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject" className={styles.label}>Asunto</label>
                <input 
                  type="text" 
                  id="subject" 
                  name="subject" 
                  className={styles.input} 
                  required 
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Consulta general"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message" className={styles.label}>Mensaje</label>
                <textarea 
                  id="message" 
                  name="message" 
                  className={styles.textarea} 
                  required 
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Escribe tu mensaje aquí..."
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary ${styles.submitBtn}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>Enviando...</>
                ) : (
                  <>
                    <Send size={18} />
                    Enviar Mensaje
                  </>
                )}
              </button>

              {hasSubmitted && (
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  backgroundColor: '#dcfce7', 
                  color: '#166534', 
                  borderRadius: 'var(--radius)', 
                  textAlign: 'center',
                  border: '1px solid #bbf7d0'
                }}>
                  ¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
