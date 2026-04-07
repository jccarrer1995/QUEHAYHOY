/**
 * Sectores del carrusel «Sectores Top» (id estable para Firestore y UI).
 * @type {readonly { id: string, label: string, image: string | null }[]}
 */
export const SECTORS = [
  { id: 'all', label: 'Todo', image: null },
  {
    id: 'urdesa',
    label: 'Urdesa',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=200&h=200&fit=crop',
  },
  {
    id: 'las-penas',
    label: 'Las Peñas',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=200&h=200&fit=crop',
  },
  {
    id: 'guayarte',
    label: 'Guayarte',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&h=200&fit=crop',
  },
  {
    id: 'samanes',
    label: 'Samanes',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=200&h=200&fit=crop',
  },
  {
    id: 'kennedy',
    label: 'Kennedy',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=200&fit=crop',
  },
  {
    id: 'bellavista',
    label: 'Bellavista',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200&h=200&fit=crop',
  },
  {
    id: 'malecon-salado',
    label: 'Malecón del Salado',
    image: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&h=200&fit=crop',
  },
  {
    id: 'centro',
    label: 'Centro',
    image: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=200&h=200&fit=crop',
  },
  {
    id: 'alborada',
    label: 'Alborada',
    image: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=200&h=200&fit=crop',
  },
  {
    id: 'la-joya',
    label: 'La Joya',
    image:
      'https://images.pexels.com/photos/325185/pexels-photo-325185.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop',
  },
]

/**
 * Si el texto de sector del evento coincide con un sector «top», devuelve su id estable.
 * Si no coincide con ninguno (p. ej. otro barrio), devuelve `null` y el evento no se oculta por preferencias.
 *
 * @param {string | undefined | null} sectorLabel - `location` / `sector` en Firestore
 * @returns {string | null}
 */
export function topSectorIdFromEventLabel(sectorLabel) {
  const t = (sectorLabel ?? '').trim()
  if (!t) return null
  for (const s of SECTORS) {
    if (s.id === 'all') continue
    if (s.label === t) return s.id
  }
  return null
}

/**
 * Quita eventos cuyo sector top está desactivado en «Sectores favoritos».
 *
 * @param {Array<{ sector?: string }>} events
 * @param {(sectorId: string) => boolean} isSectorVisible - `useSectorVisibility().isSectorVisible`
 * @returns {typeof events}
 */
export function filterEventsBySectorVisibility(events, isSectorVisible) {
  return events.filter((ev) => {
    const id = topSectorIdFromEventLabel(ev.sector)
    if (id === null) return true
    return isSectorVisible(id)
  })
}

/**
 * Filtro del chip «Sectores top» del home (misma lógica que `useEvents` con sector ≠ all).
 *
 * @param {{ sector?: string }} event
 * @param {string} sectorId - id del chip (`all`, `urdesa`, …)
 * @returns {boolean}
 */
export function eventMatchesSectorChip(event, sectorId) {
  if (!sectorId || sectorId === 'all') return true
  const entry = SECTORS.find((s) => s.id === sectorId)
  if (!entry || entry.id === 'all') return true
  return (event.sector ?? '').trim() === entry.label
}
