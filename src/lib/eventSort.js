import { isEventExpired } from './eventExpiration.js'

/** @typedef {'date-desc' | 'date-asc' | 'price-asc' | 'price-desc' | 'expired-last'} EventSortKey */

export const DEFAULT_EVENT_SORT = 'date-desc'

/** @type {ReadonlyArray<{ value: EventSortKey, label: string }>} */
export const EVENT_SORT_OPTIONS = [
  { value: 'date-desc', label: 'Fecha: mayor a menor' },
  { value: 'date-asc', label: 'Fecha: menor a mayor' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
  { value: 'expired-last', label: 'Finalizados al final' },
]

/**
 * @param {Record<string, unknown> | null | undefined} event
 * @returns {number}
 */
function getEventPrice(event) {
  const num = Number(event?.price)
  return Number.isFinite(num) ? num : 0
}

/**
 * @param {Record<string, unknown> | null | undefined} event
 * @returns {number}
 */
function getEventDateMs(event) {
  const ms = event?.dateMs
  return typeof ms === 'number' && Number.isFinite(ms) ? ms : 0
}

/**
 * @param {Record<string, unknown>} a
 * @param {Record<string, unknown>} b
 * @param {EventSortKey} sortKey
 * @returns {number}
 */
function compareBySortKey(a, b, sortKey) {
  switch (sortKey) {
    case 'price-asc':
      return getEventPrice(a) - getEventPrice(b)
    case 'price-desc':
      return getEventPrice(b) - getEventPrice(a)
    case 'date-asc':
      return getEventDateMs(a) - getEventDateMs(b)
    case 'expired-last':
    case 'date-desc':
    default:
      return getEventDateMs(b) - getEventDateMs(a)
  }
}

/**
 * Separa vigentes y expirados; ordena cada grupo con el criterio elegido.
 * Los expirados siempre van al final del feed.
 *
 * @param {ReadonlyArray<Record<string, unknown>>} events
 * @param {EventSortKey} sortKey
 * @returns {Record<string, unknown>[]}
 */
export function sortEvents(events, sortKey) {
  /** @type {Record<string, unknown>[]} */
  const active = []
  /** @type {Record<string, unknown>[]} */
  const expired = []

  for (const event of events) {
    if (isEventExpired(event)) {
      expired.push(event)
    } else {
      active.push(event)
    }
  }

  const sorter = (/** @type {Record<string, unknown>} */ a, /** @type {Record<string, unknown>} */ b) =>
    compareBySortKey(a, b, sortKey)

  active.sort(sorter)
  expired.sort(sorter)

  return [...active, ...expired]
}
