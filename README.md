This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Datos de contacto y ubicación (Sistema de Admisión Escolar)

```bash
node scripts/enrich-from-sae.mjs
```

Consulta por RBD la API pública de la Vitrina del Mineduc (admision.mineduc.cl) y completa en
`data/schools.json` el sitio web, correo, teléfono, dirección y coordenadas que falten. Solo
incluye colegios que participan en el SAE (no particulares pagados). Las respuestas quedan en
`data/raw/sae/` (ignorado por git), así que volver a ejecutarlo es rápido; usa `--refresh` para
consultar de nuevo.

## Coordenadas para la búsqueda en mapa

El modo "Buscar en mapa" muestra los colegios que tienen `lat`/`lng` en `data/schools.json`.
La mayoría viene del script anterior. Para los que faltan (sobre todo particulares pagados):

```bash
node scripts/geocode-osm.mjs
```

Ubica con OpenStreetMap (Nominatim) los colegios sin coordenadas: por dirección, o por nombre si
OpenStreetMap lo tiene registrado como colegio. Solo acepta resultados dentro de la comuna del
colegio y a menos de 40 km de sus otros colegios. Respeta el límite de 1 consulta por segundo y
guarda las respuestas en `data/raw/geocode/`.

Otra alternativa son las coordenadas del Mineduc publicadas en Itrend:

**Opción A: descarga automática desde Itrend.** Crea tus credenciales en
https://www.plataformadedatos.cl/user/developer, copia `.env.example` a `.env.local`, completa
`ITREND_ACCESS_KEY_ID` y `ITREND_SECRET_ACCESS_KEY`, y ejecuta:

```bash
npm run coords:download
```

Descarga la capa "Establecimientos de Educación Escolar" del Mineduc a `data/raw/` (ignorado por git)
y agrega las coordenadas a `data/schools.json`.

**Opción B: CSV propio.** Descarga un CSV del Mineduc con columnas `RBD`, `LATITUD` y `LONGITUD`
(por ejemplo el "Directorio Oficial de Establecimientos" de datosabiertos.mineduc.cl) y ejecuta:

```bash
node scripts/add-coordinates.mjs ruta/al/directorio.csv
```

El script cruza los colegios por RBD, descarta coordenadas fuera de Chile e informa cuántos quedaron sin ubicación.
No subas el CSV al repositorio; basta con el `schools.json` actualizado.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
