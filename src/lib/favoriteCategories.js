/**
 * Helpers para visibilidad de categorías en Home y pantallas derivadas.
 */

export function normalizeCategoryId(categoryId) {
  if (typeof categoryId !== 'string') return ''
  return categoryId.trim().toLowerCase()
}

/**
 * @param {{ category?: string | null }[]} events
 * @param {(categoryId: string) => boolean} isCategoryVisible
 */
export function filterEventsByCategoryVisibility(events, isCategoryVisible) {
  return events.filter((event) => isCategoryVisible(normalizeCategoryId(event.category ?? '')))
}
