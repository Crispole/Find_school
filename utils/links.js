// Adds the protocol when the data stores bare domains like "colegio.cl"
export const toExternalUrl = (website) => {
  if (!website) return null;
  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
};

// Google Maps search; falls back to the school name when there is no street address
export const toMapsUrl = (school) => {
  const place = school.address ? `${school.address}, ${school.commune}` : `${school.name}, ${school.commune}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
};
