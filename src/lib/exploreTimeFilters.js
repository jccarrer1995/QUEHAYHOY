/**
 * Filtros secundarios de Explorar: gratis y ventana de tiempo (hoy, mañana, fin de semana, mes).
 * Fechas en zona horaria local del navegador (idealmente Ecuador; el usuario suele estar en GYE).
 */

/** @typedef {'today' | 'tomorrow' | 'weekend' | 'month'} ExploreTimePreset */

/** @type {{ id: ExploreTimePreset, label: string }[]} */
export const EXPLORE_TIME_CHIPS = [
  { id: 'today', label: 'Hoy' },
  { id: 'tomorrow', label: 'Mañana' },
  { id: 'weekend', label: 'Fin de semana' },
  { id: 'month', label: 'Mes' },
]

/**
 * Misma regla que el home para «Gratis».
 * @param {{ price?: unknown }} e
 * @returns {boolean}
 */
export function isEventGratis(e) {
  const p = e.price
  if (p === 0 || p === '0') return true
  if (p == null || p === '') return true
  const n = typeof p === 'number' ? p : Number(p)
  return !Number.isNaN(n) && n === 0
}

/**
 * @param {number} dayStartMs
 * @param {number} dayEndMs
 * @param {{ dateMs?: number | null, endDateMs?: number | null }} event
 */
function uniqueEventIntersectsRange(event, rangeStartMs, rangeEndMs) {
  const start = event.dateMs
  if (start == null || Number.isNaN(start) || start === Number.POSITIVE_INFINITY) return false
  const end = event.endDateMs ?? start
  return start <= rangeEndMs && end >= rangeStartMs
}

/** Inicio y fin del día local (00:00–23:59:59.999). */
function localDayBoundsMs(offsetFromToday) {
  const base = new Date()
  base.setHours(0, 0, 0, 0)
  base.setDate(base.getDate() + offsetFromToday)
  const start = base.getTime()
  const end = new Date(base)
  end.setHours(23, 59, 59, 999)
  return { start, end: end.getTime() }
}

/** Próximo sábado 00:00 local hasta domingo 23:59:59 del mismo fin de semana. */
function upcomingWeekendBoundsMs() {
  const now = new Date()
  const dow = now.getDay()
  const sat = new Date(now)
  sat.setHours(0, 0, 0, 0)
  const add = (6 - dow + 7) % 7
  sat.setDate(sat.getDate() + add)
  const sun = new Date(sat)
  sun.setDate(sun.getDate() + 1)
  sun.setHours(23, 59, 59, 999)
  return { start: sat.getTime(), end: sun.getTime() }
}

/** Primer y último instante del mes local actual. */
function currentMonthBoundsMs() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
  return { start: start.getTime(), end: end.getTime() }
}

/**
 * @param {{ type?: string, recurrence_day?: number | null }} event
 * @param {number} weekdayJs - 0 domingo … 6 sábado (Date.getDay)
 */
function recurringMatchesWeekday(event, weekdayJs) {
  if (event.type !== 'recurring') return false
  const rd = event.recurrence_day
  if (rd == null || Number.isNaN(Number(rd))) return false
  return Number(rd) === weekdayJs
}

/**
 * @param {{ type?: string, recurrence_day?: number | null }} event
 */
function recurringMatchesWeekend(event) {
  if (event.type !== 'recurring') return false
  const rd = event.recurrence_day
  if (rd == null || Number.isNaN(Number(rd))) return false
  return rd === 0 || rd === 6
}

/**
 * @param {ExploreTimePreset | null | undefined} preset
 * @param {{ type?: string, dateMs?: number | null, endDateMs?: number | null, recurrence_day?: number | null }} event
 * @returns {boolean}
 */
export function eventMatchesTimePreset(event, preset) {
  if (preset == null) return true

  if (preset === 'today') {
    const { start, end } = localDayBoundsMs(0)
    if (event.type === 'unique') return uniqueEventIntersectsRange(event, start, end)
    if (event.type === 'recurring') return recurringMatchesWeekday(event, new Date().getDay())
    return false
  }

  if (preset === 'tomorrow') {
    const { start, end } = localDayBoundsMs(1)
    if (event.type === 'unique') return uniqueEventIntersectsRange(event, start, end)
    if (event.type === 'recurring') {
      const t = new Date()
      t.setDate(t.getDate() + 1)
      return recurringMatchesWeekday(event, t.getDay())
    }
    return false
  }

  if (preset === 'weekend') {
    const { start, end } = upcomingWeekendBoundsMs()
    if (event.type === 'unique') return uniqueEventIntersectsRange(event, start, end)
    if (event.type === 'recurring') return recurringMatchesWeekend(event)
    return false
  }

  if (preset === 'month') {
    const { start, end } = currentMonthBoundsMs()
    if (event.type === 'unique') return uniqueEventIntersectsRange(event, start, end)
    if (event.type === 'recurring') return true
    return false
  }

  return true
}

/**
 * @template T
 * @param {T[]} events
 * @param {{ isFreeActive: boolean, timePreset: ExploreTimePreset | null }} opts
 * @returns {T[]}
 */
export function filterEventsByExploreSecondary(events, opts) {
  let list = events
  if (opts.isFreeActive) {
    list = list.filter((e) => isEventGratis(e))
  }
  if (opts.timePreset != null) {
    list = list.filter((e) => eventMatchesTimePreset(e, opts.timePreset))
  }
  return list
}
