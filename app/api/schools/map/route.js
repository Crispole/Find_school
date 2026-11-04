import { NextResponse } from 'next/server';
import { getMapSchools } from '../../../../lib/schools';

// GET /api/schools/map?commune=Ñuñoa&dependency=&keywords=Laico,Mixto&scoreMetric=paes-mat&minScore=600
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const commune = params.get('commune');

  if (!commune) {
    console.warn(JSON.stringify({ level: 'warn', event: 'api_invalid_params', path: request.nextUrl.pathname, reason: 'missing commune' }));
    return NextResponse.json({ error: 'Debes indicar una comuna' }, { status: 400 });
  }

  return NextResponse.json(getMapSchools({
    commune,
    dependency: params.get('dependency') || '',
    keywords: (params.get('keywords') || '').split(',').filter(Boolean),
    scoreMetric: params.get('scoreMetric') || '',
    minScore: params.get('minScore') || '',
  }));
}
