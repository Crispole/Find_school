// Downloads the Mineduc "Establecimientos de Educación Escolar" layer (RBD,
// LATITUD, LONGITUD) from Itrend's Plataforma de Datos and adds the
// coordinates to data/schools.json.
//
// Credentials: create them at https://www.plataformadedatos.cl/user/developer
// and put them in .env.local (never committed):
//   ITREND_ACCESS_KEY_ID=...
//   ITREND_SECRET_ACCESS_KEY=...
//
// Usage: npm run coords:download
//
// Same API the official `pytrend` Python library uses (github.com/ItrendCL/pytrend).
import { mkdirSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ITREND_API = 'https://6olpgdxhp8.execute-api.us-east-1.amazonaws.com/prod/itrend-developer-tools';
const DATASET_IDS = ['itrend-ds:925766D40B2366D', '925766D40B2366D'];
const RAW_DIR = fileURLToPath(new URL('../data/raw/', import.meta.url));

const accessKeyId = process.env.ITREND_ACCESS_KEY_ID;
const secretAccessKey = process.env.ITREND_SECRET_ACCESS_KEY;
if (!accessKeyId || !secretAccessKey) {
  console.error('Faltan ITREND_ACCESS_KEY_ID y/o ITREND_SECRET_ACCESS_KEY en .env.local');
  process.exit(1);
}

// Asks the API for a temporary download URL of the CSV
async function requestDownload(datasetId) {
  const params = new URLSearchParams({ dataset_id: datasetId, fmt: 'csv', source: 'pytrend' });
  const res = await fetch(`${ITREND_API}?${params}`, {
    headers: { access_key_id: accessKeyId, secret_access_key: secretAccessKey },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) {
    throw new Error(`HTTP ${res.status}: ${body.message || body.error || 'credenciales o dataset inválidos'}`);
  }
  return body;
}

let download;
for (const datasetId of DATASET_IDS) {
  try {
    download = await requestDownload(datasetId);
    break;
  } catch (error) {
    console.warn(`No se pudo con ${datasetId}: ${error.message}`);
  }
}
if (!download) {
  console.error('No se pudo obtener el archivo. Revisa tus credenciales en .env.local.');
  process.exit(1);
}

const file = await fetch(download.url);
if (!file.ok) {
  console.error(`Error al descargar el archivo: HTTP ${file.status}`);
  process.exit(1);
}
const content = Buffer.from(await file.arrayBuffer());
mkdirSync(RAW_DIR, { recursive: true });
if (content.subarray(0, 2).toString() === 'PK') {
  console.error('El archivo llegó comprimido (ZIP). Descomprímelo y usa: node scripts/add-coordinates.mjs <archivo.csv>');
  writeFileSync(`${RAW_DIR}establecimientos.zip`, content);
  process.exit(1);
}

const csvPath = `${RAW_DIR}establecimientos.csv`;
writeFileSync(csvPath, content);
console.log(`Descargado: ${csvPath} (${(content.length / 1024 / 1024).toFixed(1)} MB)`);

const merge = spawnSync(process.execPath, [fileURLToPath(new URL('./add-coordinates.mjs', import.meta.url)), csvPath], { stdio: 'inherit' });
process.exit(merge.status ?? 1);
