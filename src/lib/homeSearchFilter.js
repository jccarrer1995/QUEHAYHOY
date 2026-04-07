/**
 * Mismo criterio que el buscador del Navbar en el home (título, sector, descripción).
 *
 * @param {Array<{ title?: string, sector?: string, description?: string }>} events
 * @param {string} searchQuery
 * @returns {typeof events}
 */
export function filterEventsByHomeSearch(events, searchQuery) {
  if (!searchQuery?.trim()) return events
  const q = searchQuery.toLowerCase()
  return events.filter(
    (e) =>
      e.title?.toLowerCase().includes(q) ||
      e.sector?.toLowerCase().includes(q) ||
      e.description?.toLowerCase().includes(q)
  )
}
