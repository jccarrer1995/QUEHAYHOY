/**
 * Badges de evento (Firestore `badgeType`) — textos, colores y normalización
 * Sin iconos/emojis: solo texto + fondo semántico (ver EventBadge.jsx)
 */

export const BADGE_TEXT = {
  SOLO_HOY: 'SOLO HOY',
  MASIVO: 'MASIVO',
  RECOMENDADO: 'RECOMENDADO',
  PET_FRIENDLY: 'PET FRIENDLY',
  PROMO: 'PROMO',
  GRATIS: 'GRATIS',
}

/**
 * Fondo por tipo (Tailwind / hex). Texto siempre blanco en el componente.
 * @type {Record<keyof typeof BADGE_TEXT, string>}
 */
export const BADGE_BG_CLASS = {
  SOLO_HOY: 'bg-amber-500',
  MASIVO: 'bg-red-600',
  RECOMENDADO: 'bg-amber-600',
  PET_FRIENDLY: 'bg-[#A16207]',
  PROMO: 'bg-orange-600',
  GRATIS: 'bg-emerald-600',
}

/** Opciones del select en Admin (valor → Firestore `badgeType`) */
export const BADGE_FORM_OPTIONS = [
  { value: '', label: 'Sin badge' },
  { value: 'SOLO_HOY', label: 'SOLO HOY' },
  { value: 'MASIVO', label: 'MASIVO' },
  { value: 'RECOMENDADO', label: 'RECOMENDADO' },
  { value: 'PET_FRIENDLY', label: 'PET FRIENDLY' },
  { value: 'PROMO', label: 'PROMO' },
  { value: 'GRATIS', label: 'GRATIS' },
]

/**
 * Normaliza el valor de Firestore a una clave conocida.
 * @param {unknown} raw
 * @returns {keyof typeof BADGE_TEXT | null}
 */
export function normalizeBadgeType(raw) {
  if (raw == null || raw === '') return null
  const s = String(raw).trim().toUpperCase().replace(/[\s-]+/g, '_')
  /** @type {Record<string, keyof typeof BADGE_TEXT>} */
  const map = {
    SOLO_HOY: 'SOLO_HOY',
    SOLOHOY: 'SOLO_HOY',
    MASIVO: 'MASIVO',
    RECOMENDADO: 'RECOMENDADO',
    RECOMMENDED: 'RECOMENDADO',
    PET_FRIENDLY: 'PET_FRIENDLY',
    PETFRIENDLY: 'PET_FRIENDLY',
    PET: 'PET_FRIENDLY',
    PROMO: 'PROMO',
    GRATIS: 'GRATIS',
    FREE: 'GRATIS',
  }
  const key = map[s]
  return key && BADGE_TEXT[key] ? key : null
}

/**
 * Valor para el formulario admin (string vacío o clave SOLO_HOY, …).
 * @param {unknown} raw
 * @returns {string}
 */
export function badgeTypeToFormValue(raw) {
  const key = normalizeBadgeType(raw)
  return key ?? ''
}

/**
 * Migra `badgeLabel` antiguo (MASIVO, FERIA, …) a claves nuevas.
 * @param {unknown} raw
 * @returns {string}
 */
export function legacyBadgeLabelToFormValue(raw) {
  if (raw == null || raw === '') return ''
  const v = String(raw).trim().toUpperCase()
  if (v === 'MASIVO') return 'MASIVO'
  if (v === 'FERIA') return 'PROMO'
  if (v === 'PROMO') return 'PROMO'
  if (v === 'SOCIAL') return 'RECOMENDADO'
  return ''
}

/**
 * Prioriza `badgeType` en Firestore; si no hay, mapea `badgeLabel` antiguo.
 * @param {Record<string, unknown> | null | undefined} data
 * @returns {string | null}
 */
export function resolveEventBadgeTypeFromDoc(data) {
  if (!data || typeof data !== 'object') return null
  if (normalizeBadgeType(data.badgeType)) return String(data.badgeType).trim()
  const legacy = legacyBadgeLabelToFormValue(data.badgeLabel ?? data.capacity_level)
  return legacy || null
}
