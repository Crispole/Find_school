// Only http(s) links may reach an href: anything else ("javascript:", "data:", ...) is dropped.
// Adds the protocol when the data stores bare domains like "colegio.cl".
export const toExternalUrl = (website) => {
  if (!website) return null;
  const candidate = /^https?:\/\//i.test(website) ? website : `https://${website}`;
  try {
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
};

// Many small schools only have a social profile; the button says so instead of "Sitio Web"
export const websiteLabel = (website, { long = false } = {}) => {
  if (/(^|\.)facebook\.com|fb\.com/i.test(website || '')) return 'Ver Facebook';
  if (/(^|\.)instagram\.com/i.test(website || '')) return 'Ver Instagram';
  return long ? 'Visitar sitio web' : 'Sitio Web';
};

// Google Maps search; falls back to the school name when there is no street address
export const toMapsUrl = (school) => {
  const place = school.address ? `${school.address}, ${school.commune}` : `${school.name}, ${school.commune}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
};
