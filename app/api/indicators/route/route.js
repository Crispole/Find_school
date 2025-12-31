import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://mindicador.cl/api', { next: { revalidate: 3600 } }); // Cache for 1 hour
    if (!res.ok) {
        throw new Error('Failed to fetch indicators');
    }
    const data = await res.json();
    
    return NextResponse.json({
      UF: data.uf.valor,
      USD: data.dolar.valor,
      UTM: data.utm.valor
    });
  } catch (error) {
    console.error('Error fetching indicators:', error);
    // Fallback values if API fails
    return NextResponse.json({
      UF: 38000,
      USD: 980,
      UTM: 64000
    });
  }
}
