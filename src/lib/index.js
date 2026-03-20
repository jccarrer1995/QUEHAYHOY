// Utilidades compartidas
export const SECTORS = ['Urdesa', 'Samborondón', 'Puerto Santa Ana']

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
