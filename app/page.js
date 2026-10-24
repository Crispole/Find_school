import HomeClient from '../components/HomeClient';
import { getCommunesByRegion, searchSchools } from '../lib/schools';

// Server Component: reads the JSON on the server and sends only the
// first page of results; the client fetches the rest from /api/schools.
export default function Home() {
  return (
    <HomeClient
      communesByRegion={getCommunesByRegion()}
      initialData={searchSchools()}
    />
  );
}
