// Utilidades compartidas
export { APP_VERSION } from './appVersion.js'

export const SECTORS = ['Urdesa', 'Samborondón', 'Puerto Santa Ana']

/** Nombres en plural para texto "Todos los [día]" (recurrence_day: 0=dom … 6=sáb) */
const WEEKDAY_PLURAL_ES = [
  'domingos',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábados',
]

/**
 * @param {number | string | null | undefined} dayIndex - 0–6 (JS: domingo–sábado)
 * @returns {string}
 */
export function formatRecurrenceLabel(dayIndex) {
  if (dayIndex == null || dayIndex === '') return ''
  const n = Number(dayIndex)
  if (Number.isNaN(n)) return ''
  const i = ((Math.trunc(n) % 7) + 7) % 7
  return `Todos los ${WEEKDAY_PLURAL_ES[i]}`
}

/**
 * Añade parámetros de tamaño y calidad a URLs de imagen para optimizar carga.
 * Compatible con Unsplash, Firebase Storage, imgix, Cloudinary, etc.
 * @param {string} url - URL original de la imagen
 * @param {object} [opts] - w: ancho px, q: calidad 1-100
 * @returns {string} URL con parámetros
 */
export function optimizeImageUrl(url, opts = {}) {
  if (!url || typeof url !== 'string') return url || ''
  const { w = 600, q = 80 } = opts
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}w=${w}&q=${q}`
}
