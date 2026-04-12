import { filterEventsByHomeSearch } from './homeSearchFilter.js'

/**
 * Categoría tal como viene de Firestore → id del selector (bares, conciertos, …).
 * @param {string | undefined} cat
 * @returns {string}
 */
export function firestoreCategoryToId(cat) {
  if (!cat) return 'all'
  const s = String(cat).trim()
  if (s === 'All' || s.toLowerCase() === 'all') return 'all'
  return s.charAt(0).toLowerCase() + s.slice(1)
}

/**
 * @template T
 * @param {T[]} events
 * @param {string} activeCategoryId
 * @param {string} searchQuery
 * @returns {T[]}
 */
export function filterExploreEvents(events, activeCategoryId, searchQuery) {
  let list = filterEventsByHomeSearch(events, searchQuery)
  if (activeCategoryId && activeCategoryId !== 'all') {
    list = list.filter((e) => firestoreCategoryToId(e.category) === activeCategoryId)
  }
  return list
}
