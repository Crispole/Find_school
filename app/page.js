'use client';

import { useState, useMemo, useEffect } from 'react';
import schoolsData from '../data/schools.json';
import SchoolCard from '../components/SchoolCard';
import FilterBar from '../components/FilterBar';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import CurrencySwitcher from '../components/CurrencySwitcher';
import ComparisonModal from '../components/ComparisonModal';
import Link from 'next/link';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';


export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [keywordQuery, setKeywordQuery] = useState([]);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedDependency, setSelectedDependency] = useState('');
  const [currency, setCurrency] = useState('CLP');
  const [exchangeRates, setExchangeRates] = useState({ CLP: 1, UF: 39700, USD: 900 });
  const [theme, setTheme] = useState('light');
  const [isCompareOpen, setIsCompareOpen] = useState(false);


  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const fetchRates = async () => {
        try {
            const res = await fetch('/api/indicators/route');
            if (res.ok) {
                const data = await res.json();
                setExchangeRates({ CLP: 1, UF: data.UF, USD: data.USD });
            }
        } catch (e) {
            console.error("Failed to fetch rates, using defaults.");
        }
    };
    fetchRates();

    // Set global callback for Navbar
    window.startTour = () => {
        const driverObj = driver({
            showProgress: true,
            animate: true,
            steps: [
                { element: '#tour-filters', popover: { title: 'Filtros', description: 'Selecciona el tipo de establecimiento: Todos - Municipales - Subvencionados - Particulares' } },
                { element: '#tour-compare', popover: { title: 'Compara', description: 'Elige dos establecimientos y compara sus características.' } },
                { element: '#tour-currency', popover: { title: 'Divisa', description: 'Selecciona la divisa que te más te acomode.' } },
                { element: '.tour-card-commune', popover: { title: 'Ubicación', description: 'Encuentra el establecimiento el Google Maps' } },
                { element: '.tour-card-fees', popover: { title: 'Costos', description: 'Encuentra los detalles de valores del establecimiento.' } },
                { element: '.tour-card-website', popover: { title: 'Sitio Web', description: 'Vamos a la página oficial del establecimiento.' } },
                { element: '.tour-card-contact', popover: { title: 'Contactar', description: '¿Tienes dudas? Envía un correo para solicitar más información del establecimiento.' } }
            ]
        });
        driverObj.drive();
    };

    // Check for tutorial query param
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tutorial') === 'true') {
      // Small delay to ensure render
      setTimeout(() => {
          if (window.startTour) window.startTour();
      }, 500);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
    }
  }, []);


  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Extract unique communes from data
  const communes = useMemo(() => {
    const EXTRA_COMMUNES = [
      "Colina", "Lampa", "Til-Til", "Puente Alto", "Pirque", "San José de Maipo", 
      "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", 
      "Curacaví", "María Pinto", "San Pedro", "Cerrillos", "Cerro Navia", "Conchalí", 
      "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", 
      "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", 
      "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", 
      "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", 
      "Renca", "San Joaquín", "San Miguel", "San Ramón", "Santiago", "Vitacura", 
      "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor"
    ];
    return [...new Set([...schoolsData.map(school => school.commune), ...EXTRA_COMMUNES])].sort();
  }, []);

  // Filter schools
  const filteredSchools = schoolsData.filter(school => {
    const matchesSearch = school.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCommune = selectedCommune ? school.commune === selectedCommune : true;
    const matchesDependency = selectedDependency ? school.dependency === selectedDependency : true;
    
    // Keyword matching logic
    const matchesKeywords = keywordQuery.length > 0
        ? keywordQuery.every(targetKeyword => 
            school.keywords?.some(keyword => 
                keyword.toLowerCase().includes(targetKeyword.toLowerCase())
            )
          )
        : true;

    return matchesSearch && matchesCommune && matchesKeywords && matchesDependency;
  });

  return (
    <main style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      
      <div className="container">
        <FilterBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            keywordQuery={keywordQuery}
            setKeywordQuery={setKeywordQuery}
            selectedCommune={selectedCommune}
            setSelectedCommune={setSelectedCommune}
            communes={communes}
            selectedDependency={selectedDependency}
            setSelectedDependency={setSelectedDependency}
            currency={currency}
            setCurrency={setCurrency}
            onCompareClick={() => setIsCompareOpen(true)}
        />
        
        <ComparisonModal 
            isOpen={isCompareOpen} 
            onClose={() => setIsCompareOpen(false)} 
            schools={schoolsData} 
        />



        
        <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            Mostrando <strong>{filteredSchools.length}</strong> colegios encontrados
        </div>

        {filteredSchools.length > 0 ? (
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {filteredSchools.map(school => (
                <SchoolCard key={school.id} school={school} currency={currency} rates={exchangeRates} />
            ))}
            </div>
        ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                <p style={{ fontSize: '1.2rem' }}>No se encontraron colegios con esos criterios.</p>
                <button 
                    onClick={() => { setSearchQuery(''); setSelectedCommune(''); setKeywordQuery([]); setSelectedDependency(''); }}
                    className="btn btn-outline"
                    style={{ marginTop: '1rem' }}
                >
                    Limpiar filtros
                </button>
            </div>
        )}
      </div>
    </main>
  );
}
