'use client';

import { ArrowRightLeft } from 'lucide-react';

export default function CurrencySwitcher({ currentCurrency, setCurrency }) {
  const currencies = [
    { code: 'CLP', label: 'Peso Chileno' },
    { code: 'UF', label: 'Unidad de Fomento' },
    { code: 'USD', label: 'Dólar (USD)' }
  ];

  return (
    <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--background)',
        padding: '0.25rem',
        borderRadius: '0.75rem',
        border: '1px solid var(--card-border)'
    }}>
        <div style={{ 
            padding: '0.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.8rem',
            borderRight: '1px solid var(--card-border)',
            paddingRight: '0.75rem'
        }}>
            <ArrowRightLeft size={16} />
            <span style={{ display: 'none' }}>Moneda</span>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
            {currencies.map((curr) => (
                <button
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: currentCurrency === curr.code ? 'var(--primary)' : 'transparent',
                        color: currentCurrency === curr.code ? 'white' : 'var(--text-secondary)',
                        fontWeight: currentCurrency === curr.code ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontSize: '0.85rem',
                    }}
                    title={curr.label}
                >
                    {curr.code}
                </button>
            ))}
        </div>
    </div>
  );
}
