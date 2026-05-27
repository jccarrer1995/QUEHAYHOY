/**
 * Indica si un evento ya pasó su fecha de fin (únicos) o vigencia (recurrentes).
 *
 * @param {{
 *   type?: string
 *   endDateMs?: number | null
 *   dateMs?: number | null
 *   activeUntilMs?: number | null
 * } | null | undefined} event
 * @returns {boolean}
 */
export function isEventExpired(event) {
  if (!event) return false
  const now = Date.now()
  const isRecurring = event.type === 'recurring'

  if (isRecurring) {
    const until = event.activeUntilMs
    if (typeof until === 'number' && Number.isFinite(until)) return until < now
    return false
  }

  const endMs = event.endDateMs ?? event.dateMs
  if (typeof endMs === 'number' && Number.isFinite(endMs)) return endMs < now
  return false
}
