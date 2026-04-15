/**
 * El SDK web de Firestore a veces lanza errores de sincronización interna
 * ("Target ID already exists") que no indican fallo de datos ni de reglas.
 *
 * @param {unknown} err
 * @returns {boolean}
 */
export function isFirestoreTargetIdConflictError(err) {
  if (err == null || typeof err !== 'object') return false
  const msg = 'message' in err && typeof err.message === 'string' ? err.message : String(err)
  if (msg.includes('Target ID already exists')) return true
  const code = 'code' in err && typeof err.code === 'string' ? err.code : ''
  return code === 'already-exists' && msg.includes('Target ID')
}

/**
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, ms)
  })
}
