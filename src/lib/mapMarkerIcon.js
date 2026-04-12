/**
 * Genera iconos de marcador (PNG data URL) con emoji sobre fondo circular (estilo pin suave).
 * Caché en memoria para no redibujar en cada render.
 */

/** @type {Map<string, string>} */
const cache = new Map()

const SIZE = 48
const PAD = 3

/**
 * @param {string} emoji - carácter o secuencia corta (ej. 🍺)
 * @returns {string} data:image/png;base64,...
 */
export function getEmojiMarkerDataUrl(emoji) {
  const key = emoji || '🔥'
  const cached = cache.get(key)
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
  cache.set(key, url)
  return url
}

/**
 * Marcador “marca” cuando no hay categoría conocida (logo conceptual 🔥 QUEHAYHOY).
 * @returns {string}
 */
export function getDefaultBrandMarkerDataUrl() {
  return getEmojiMarkerDataUrl('🔥')
}
