import { NextResponse } from 'next/server';
import { getMapSchools } from '../../../../lib/schools';

// GET /api/schools/map?commune=Ñuñoa&dependency=&keywords=Laico,Mixto
export async function GET(request) {
  const params = request.nextUrl.searchParams;
  const commune = params.get('commune');

  if (!commune) {
    return NextResponse.json({ error: 'Debes indicar una comuna' }, { status: 400 });
  }

  return NextResponse.json(getMapSchools({
    commune,
    dependency: params.get('dependency') || '',
    keywords: (params.get('keywords') || '').split(',').filter(Boolean),
  }));
}
