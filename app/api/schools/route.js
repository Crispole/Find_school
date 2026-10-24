import { NextResponse } from 'next/server';
import { searchSchools } from '../../../lib/schools';

// GET /api/schools?q=&commune=&dependency=&keywords=Laico,Mixto&page=1&pageSize=24
export async function GET(request) {
  const params = request.nextUrl.searchParams;

  const result = searchSchools({
    q: params.get('q') || '',
    commune: params.get('commune') || '',
    dependency: params.get('dependency') || '',
    keywords: (params.get('keywords') || '').split(',').filter(Boolean),
    page: Number(params.get('page')) || 1,
    pageSize: Number(params.get('pageSize')) || undefined,
  });

  return NextResponse.json(result);
}
