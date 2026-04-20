/**
 * Etiqueta legible del rol de Firestore para UI de perfil.
 * @param {string | null | undefined} role
 * @returns {string}
 */
export function formatProfileRoleLabel(role) {
  const r = (role ?? '').trim().toLowerCase()
  if (r === 'organizador') return 'Organizador'
  if (r === 'asistente' || r === '') return 'Asistente'
  return r.charAt(0).toUpperCase() + r.slice(1)
}
