import { useState } from 'react';
import { MapPin, Users, DollarSign, Star, School, Mail, ExternalLink, CreditCard } from 'lucide-react';
import styles from './SchoolCard.module.css';
import { convertAndFormat } from '../utils/currency';
import FeeModal from './FeeModal';

export default function SchoolCard({ school, currency, rates }) {
  const [showFeesModal, setShowFeesModal] = useState(false);

  return (
    <>
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
            <School size={24} color="var(--primary)" />
        </div>
        <div className={styles.badges}>
            <span className={`${styles.badge} ${styles[school.dependency.replace(/\s+/g, '').toLowerCase()]}`}>
                {school.dependency}
            </span>
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.name}>{school.name}</h3>
        <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(school.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.commune} tour-card-commune`}
            style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
            <MapPin size={16} style={{ marginRight: '4px' }} />
            {school.commune}
        </a>
        
        <div className={styles.details}>
            <div className={styles.detailItem}>
                <Users size={16} className={styles.detailIcon} />
                <span>{school.students} est.</span>
            </div>
            {/* Show just the tuition summary or primary cost if preferred, but user asked for ALL values. 
                We'll create a dedicated fee section below for clarity. */}
            <div className={styles.detailItem}>
                <DollarSign size={16} className={styles.detailIcon} />
                <span>Anual: {convertAndFormat(school.tuition, currency, rates)}</span>
            </div>
        </div>

        <div className={styles.fees}>
            <div 
                className={`${styles.feesHeader} tour-card-fees`} 
                onClick={() => setShowFeesModal(true)}
                title="Ver detalle de aranceles"
            >
                <h4 className={styles.feesTitle}>
                    <CreditCard size={14} style={{ marginRight: '6px' }} />
                    Costos
                </h4>
                <div className={styles.feesHint}>Ver detalle</div>
            </div>
            <div className={styles.feeGrid}>
                <div className={styles.feeItem}>
                    <span className={styles.feeLabel}>Incorporación</span>
                    <span className={styles.feeValue}>{convertAndFormat(school.incorporation_fee, currency, rates)}</span>
                </div>
                <div className={styles.feeItem}>
                    <span className={styles.feeLabel}>Matrícula</span>
                    <span className={styles.feeValue}>{convertAndFormat(school.enrollment_fee, currency, rates)}</span>
                </div>
                <div className={styles.feeItem}>
                    <span className={styles.feeLabel}>Mensualidad</span>
                    <span className={styles.feeValue}>{convertAndFormat(school.monthly_fee, currency, rates)}</span>
                </div>
            </div>
        </div>

        <div className={styles.rating}>
            <div className={styles.stars}>
                {[...Array(5)].map((_, i) => (
                    <Star 
                        key={i} 
                        size={14} 
                        fill={i < Math.floor(school.rating) ? "#fbbf24" : "none"} 
                        color={i < Math.floor(school.rating) ? "#fbbf24" : "#cbd5e1"}
                    />
                ))}
            </div>
            <span className={styles.ratingValue}>{school.rating}</span>
             <span className={styles.reviewCount}>({school.reviews.length} reviews)</span>
        </div>
        
        {school.reviews.length > 0 && (
            <div className={styles.reviewSnippet}>
                <p>"{school.reviews[0].comment}"</p>
            </div>
        )}

        <div className={styles.actions}>
            <a href={school.website} target="_blank" rel="noopener noreferrer" className={`${styles.btn} ${styles.btnOutline} tour-card-website`}>
                <ExternalLink size={16} />
                Sitio Web
            </a>
            <a href={`mailto:${school.email}`} className={`${styles.btn} ${styles.btnPrimary} tour-card-contact`}>
                <Mail size={16} />
                Contactar
            </a>
        </div>
      </div>
    </div>

    <FeeModal 
        isOpen={showFeesModal} 
        onClose={() => setShowFeesModal(false)}
        school={school}
        currency={currency}
        rates={rates}
    />
    </>
  );
}
