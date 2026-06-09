/**
 * Etiquetas de zona para badges en preferencias de sectores.
 * @type {Record<string, string>}
 */
export const SECTOR_ZONE_BADGE = {
  urdesa: 'Sur',
  'las-penas': 'Sur',
  guayarte: 'Sur',
  samanes: 'Norte',
  kennedy: 'Norte',
  bellavista: 'Sur',
  'malecon-salado': 'Sur',
  centro: 'Centro',
  alborada: 'Norte',
  'la-joya': 'Norte',
  norte: 'Norte',
}

/**
 * @param {string} sectorId
 * @returns {string}
 */
export function getSectorZoneBadge(sectorId) {
  return SECTOR_ZONE_BADGE[sectorId] ?? 'GYE'
}
