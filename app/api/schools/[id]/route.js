import { NextResponse } from 'next/server';
import { getSchoolById } from '../../../../lib/schools';

// GET /api/schools/123
export async function GET(request, { params }) {
  const { id } = await params;
  const school = getSchoolById(id);

  if (!school) {
    return NextResponse.json({ error: 'Colegio no encontrado' }, { status: 404 });
  }
  return NextResponse.json(school);
}
