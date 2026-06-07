import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebaseConfig.js'

export const HISTORICAL_TRIALS_COLLECTION = 'historical_trials'

/**
 * Hash SHA-256 de un identificador (email o teléfono) normalizado.
 * No almacenamos el valor en claro por privacidad.
 *
 * @param {string} value
 * @returns {Promise<string>}
 */
export async function hashIdentifier(value) {
  const normalized = value.trim().toLowerCase()
  if (!normalized) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(normalized)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * @param {string | null | undefined} email
 * @returns {Promise<boolean>}
 */
export async function hasUsedTrialBefore(email) {
  if (!db || !email || email.trim() === '') return false
  const id = await hashIdentifier(email)
  if (!id) return false
  const snap = await getDoc(doc(db, HISTORICAL_TRIALS_COLLECTION, id))
  if (!snap.exists()) return false
  const data = snap.data()
  return data?.usedTrial === true
}

/**
 * Registra borrado lógico para impedir reutilizar el mes gratis con el mismo correo.
 *
 * @param {{ email?: string | null, phone?: string | null, usedTrial: boolean }} params
 */
export async function recordAccountDeletionTrialFlag({ email, phone, usedTrial }) {
  if (!db || !usedTrial) return

  const identifier = (email && email.trim() !== '' ? email : null) ?? (phone && phone.trim() !== '' ? phone : null)
  if (!identifier) return

  const id = await hashIdentifier(identifier)
  if (!id) return

  await setDoc(
    doc(db, HISTORICAL_TRIALS_COLLECTION, id),
    {
      usedTrial: true,
      deletedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
