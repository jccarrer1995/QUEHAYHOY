/**
 * Marcadores circulares (PNG data URL) con emoji centrado.
 */

/** @type {Map<string, string>} */
const cache = new Map()

/** Invalida caché al cambiar el dibujo del marcador. */
const CACHE_VERSION = 'circle-v1'

const SIZE = 48
const PAD = 3

export const MARKER_ICON_WIDTH = SIZE
export const MARKER_ICON_HEIGHT = SIZE

/** Ancla en imagen a tamaño completo (centro inferior del círculo). */
export const MARKER_ICON_ANCHOR_X = SIZE / 2
export const MARKER_ICON_ANCHOR_Y = SIZE / 2 + (SIZE / 2 - PAD)

/** Mismo criterio que antes en el mapa: 40×40 y ancla (20, 36). */
export const MARKER_MAP_SCALED_WIDTH = 40
export const MARKER_MAP_SCALED_HEIGHT = 40
export const MARKER_MAP_ANCHOR_X = 20
export const MARKER_MAP_ANCHOR_Y = 36

/**
 * @param {string} emoji - carácter o secuencia corta (ej. 🍺)
 * @returns {string} data:image/png;base64,...
 */
export function getEmojiMarkerDataUrl(emoji) {
  const key = emoji || '🔥'
  const cacheKey = `${CACHE_VERSION}:${key}`
  const cached = cache.get(cacheKey)
  if (cached) return cached

  if (typeof document === 'undefined') {
    return ''
  }

  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return ''
  }

  const cx = SIZE / 2
  const cy = SIZE / 2
  const r = SIZE / 2 - PAD

  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  ctx.shadowColor = 'transparent'

  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 1
  ctx.stroke()

  ctx.font = `${Math.floor(SIZE * 0.48)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(key, cx, cy)

  const url = canvas.toDataURL('image/png')
  cache.set(cacheKey, url)
  return url
}

/**
 * Marcador por defecto cuando no hay categoría conocida.
 * @returns {string}
 */
export function getDefaultBrandMarkerDataUrl() {
  return getEmojiMarkerDataUrl('🔥')
}
