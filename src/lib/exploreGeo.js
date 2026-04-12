/**
 * Posiciones aproximadas en el mapa para eventos sin `latitude`/`longitude` en Firestore.
 * Usa el sector (etiqueta humana) como ancla y un jitter determinista por id para separar pins.
 */

/** Centro de Guayaquil por defecto */
export const GUAYAQUIL_DEFAULT = { lat: -2.189413, lng: -79.889483 }

/**
 * Anclas por nombre de sector (mismo texto que guarda Firestore en `location`/`sector`).
 * @type {Record<string, { lat: number, lng: number }>}
 */
export const SECTOR_ANCHOR_BY_LABEL = {
  Urdesa: { lat: -2.1572, lng: -79.8935 },
  'Las Peñas': { lat: -2.2028, lng: -79.8829 },
  Guayarte: { lat: -2.185, lng: -79.875 },
  Samanes: { lat: -2.11, lng: -79.902 },
  Kennedy: { lat: -2.082, lng: -79.895 },
  Bellavista: { lat: -2.071, lng: -79.915 },
  'Malecón del Salado': { lat: -2.189, lng: -79.877 },
  Centro: { lat: -2.1955, lng: -79.8822 },
  Alborada: { lat: -2.085, lng: -79.922 },
  'La Joya': { lat: -2.045, lng: -79.912 },
}

/**
 * @param {string} id
 * @returns {{ dLat: number, dLng: number }}
 */
export function jitterFromId(id) {
  let h = 0
  for (let i = 0; i < id.length; i += 1) {
    h = (h << 5) - h + id.charCodeAt(i)
    h |= 0
  }
  const angle = ((Math.abs(h) % 360) * Math.PI) / 180
  const radius = 0.0018 + (Math.abs(h) % 400) / 400000
  return { dLat: Math.cos(angle) * radius, dLng: Math.sin(angle) * radius }
}

/**
 * @param {{ id?: string, sector?: string, latitude?: number | null, longitude?: number | null }} event
 * @returns {{ lat: number, lng: number }}
 */
export function getEventMapPosition(event) {
  const lat = event.latitude
  const lng = event.longitude
  if (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !Number.isNaN(lat) &&
    !Number.isNaN(lng)
  ) {
    return { lat, lng }
  }
  const sector = (event.sector ?? '').trim()
  const anchor = SECTOR_ANCHOR_BY_LABEL[sector] ?? GUAYAQUIL_DEFAULT
  const { dLat, dLng } = jitterFromId(String(event.id ?? ''))
  return { lat: anchor.lat + dLat, lng: anchor.lng + dLng }
}
