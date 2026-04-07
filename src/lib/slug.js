/**
 * Slugs URL-friendly para eventos (categoria/slug-del-evento).
 */

import { collection, getDocs, limit, query, where } from 'firebase/firestore'

/**
 * Convierte un string a formato de URL: minúsculas, sin acentos, sin caracteres especiales, espacios → guiones.
 * @param {string} text
 * @returns {string}
 */
export function generateSlug(text) {
  if (!text || typeof text !== 'string') return ''
  const normalized = text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
  return normalized || 'evento'
}

/**
 * Sufijo aleatorio corto (hex) para desambiguar slugs duplicados.
 * @param {number} [byteLen=2] — longitud en bytes (4 chars hex por 2 bytes)
 * @returns {string}
 */
export function generateShortUniqueSuffix(byteLen = 2) {
  const bytes = new Uint8Array(Math.max(1, byteLen))
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Id de categoría del formulario → segmento de URL (bares, conciertos, o general si no aplica).
 * @param {string} categoryId
 * @returns {string}
 */
export function categoryIdToSlugSegment(categoryId) {
  if (!categoryId || categoryId === 'all') return 'general'
  const s = generateSlug(categoryId)
  return s || 'general'
}

/**
 * Path completo guardado en Firestore: `categoria/event-slug`.
 * @param {string} categoryId
 * @param {string} eventTitleSlug
 * @returns {string}
 */
export function buildEventSlugPath(categoryId, eventTitleSlug) {
  const cat = categoryIdToSlugSegment(categoryId)
  const ev = eventTitleSlug || 'evento'
  return `${cat}/${ev}`
}

/**
 * Genera un slug único en la colección `events` (consulta por campo `slug`).
 * Si hay colisión con otro documento, añade un sufijo corto al segmento del evento.
 *
 * @param {import('firebase/firestore').Firestore} db
 * @param {{ category: string, title: string }} form
 * @param {string | null | undefined} currentEventId - id del doc al editar, o null al crear
 * @returns {Promise<string>}
 */
export async function ensureUniqueEventSlug(db, form, currentEventId) {
  const categorySegment = categoryIdToSlugSegment(form.category ?? 'general')
  const titleSlug = generateSlug((form.title ?? '').trim())
  let eventSlug = titleSlug || 'evento'
  let fullSlug = `${categorySegment}/${eventSlug}`

  for (let attempt = 0; attempt < 24; attempt++) {
    const q = query(collection(db, 'events'), where('slug', '==', fullSlug), limit(1))
    const snap = await getDocs(q)
    if (snap.empty) return fullSlug
    const docSnap = snap.docs[0]
    if (currentEventId && docSnap.id === currentEventId) return fullSlug
    eventSlug = `${titleSlug || 'evento'}-${generateShortUniqueSuffix(2)}`
    fullSlug = `${categorySegment}/${eventSlug}`
  }
  throw new Error('No se pudo generar un slug único')
}

/**
 * Ruta de detalle pública: `/evento/:categoria/:slug` si hay `slug` compuesto; si no, fallback legacy por id.
 * @param {{ id?: string, slug?: string | null }} ev
 * @returns {string | null}
 */
export function getEventDetailPath(ev) {
  if (!ev) return null
  if (typeof ev.slug === 'string' && ev.slug.includes('/')) {
    const idx = ev.slug.indexOf('/')
    const cat = ev.slug.slice(0, idx)
    const evSlug = ev.slug.slice(idx + 1)
    if (!cat || !evSlug) return ev.id ? `/evento/${ev.id}` : null
    return `/evento/${encodeURIComponent(cat)}/${encodeURIComponent(evSlug)}`
  }
  if (ev.id) return `/evento/${ev.id}`
  return null
}

/**
 * URL absoluta del evento (respeta `import.meta.env.BASE_URL`).
 * @param {{ id?: string, slug?: string | null } | null | undefined} ev
 * @param {string | null | undefined} legacyId - id Firestore si aún no hay `ev` cargado
 * @returns {string}
 */
export function buildPublicEventUrl(ev, legacyId) {
  if (typeof window === 'undefined') return ''
  const baseRoot = `${window.location.origin}${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}`
  const path = ev ? getEventDetailPath(ev) : null
  if (path) {
    const rel = path.startsWith('/') ? path.slice(1) : path
    return `${baseRoot}/${rel}`
  }
  const id = legacyId ?? ev?.id
  if (id) return `${baseRoot}/evento/${id}`
  return ''
}
