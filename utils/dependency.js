// Marker / legend colors per dependency type (same order as the filter buttons)
export const DEPENDENCY_COLORS = [
  { dependency: 'Municipal', label: 'Municipal', color: '#0ea5e9' },
  { dependency: 'Particular Subvencionado', label: 'Subvencionado', color: '#f59e0b' },
  { dependency: 'Particular Pagado', label: 'Particular', color: '#16a34a' },
  { dependency: 'Corporación de Administración Delegada', label: 'Adm. Delegada', color: '#8b5cf6' },
];

const FALLBACK_COLOR = '#64748b';

export const getDependencyColor = (dependency) =>
  DEPENDENCY_COLORS.find((item) => item.dependency === dependency)?.color || FALLBACK_COLOR;
