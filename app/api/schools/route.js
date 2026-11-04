import { NextResponse } from 'next/server';
import { searchSchools } from '../../../lib/schools';

// GET /api/schools?q=&commune=&dependency=&keywords=Laico,Mixto&scoreMetric=paes-mat&minScore=600&page=1&pageSize=24[&cumulative=1]
export async function GET(request) {
  const params = request.nextUrl.searchParams;

  const result = searchSchools({
    q: params.get('q') || '',
    commune: params.get('commune') || '',
    dependency: params.get('dependency') || '',
    keywords: (params.get('keywords') || '').split(',').filter(Boolean),
    scoreMetric: params.get('scoreMetric') || '',
    minScore: params.get('minScore') || '',
    page: Number(params.get('page')) || 1,
    pageSize: Number(params.get('pageSize')) || undefined,
    cumulative: params.get('cumulative') === '1',
  });

  return NextResponse.json(result);
}
