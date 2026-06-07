export const ORGANIZER_EDIT_LOCKED_MESSAGE =
  'No puedes editar el evento el mismo día de su realización'

export const ORGANIZER_DELETE_LOCKED_MESSAGE =
  'No puedes eliminar el evento el mismo día de su realización'

/**
 * @param {Date} [referenceDate]
 * @returns {{ startMs: number, endMs: number, weekday: number }}
 */
function getTodayBounds(referenceDate = new Date()) {
  const startOfDay = new Date(referenceDate)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)
  return {
    startMs: startOfDay.getTime(),
    endMs: endOfDay.getTime(),
    weekday: referenceDate.getDay(),
  }
}

/**
 * Indica si el evento ocurre hoy (inicio del único o día de recurrencia activo).
 *
 * @param {{
 *   type?: string
 *   eventType?: string
 *   dateMs?: number | null
 *   recurrence_day?: number | null
 *   activeUntilMs?: number | null
 * } | null | undefined} event
 * @returns {boolean}
 */
export function isEventScheduledForToday(event) {
  if (!event) return false

  const now = Date.now()
  const { startMs, endMs, weekday } = getTodayBounds()
  const isRecurring = event.type === 'recurring' || event.eventType === 'recurring'

  if (isRecurring) {
    const recurrenceDay = Number(event.recurrence_day)
    if (Number.isNaN(recurrenceDay)) return false
    const activeUntil = event.activeUntilMs
    if (typeof activeUntil === 'number' && Number.isFinite(activeUntil) && activeUntil < now) {
      return false
    }
    return recurrenceDay === weekday
  }

  const dateMs = event.dateMs
  if (typeof dateMs !== 'number' || !Number.isFinite(dateMs)) return false
  return dateMs >= startMs && dateMs < endMs
}

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
