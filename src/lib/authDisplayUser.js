import { useSyncExternalStore } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig.js'

function subscribeAuthUid(onStoreChange) {
  if (!auth) return () => {}

  const unsubAuth = onAuthStateChanged(auth, onStoreChange)

  /**
   * En móvil, al volver de `signInWithRedirect` / pestaña de Google, el listener de Auth a veces
   * no basta para que React vuelva a leer `currentUser`. Estos eventos fuerzan un nuevo snapshot.
   */
  const ping = () => {
    onStoreChange()
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') ping()
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('pageshow', ping)

  return () => {
    unsubAuth()
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('pageshow', ping)
  }
}

function getAuthUidSnapshot() {
  return auth?.currentUser?.uid ?? ''
}

function getServerAuthUidSnapshot() {
  return ''
}

/**
 * Se actualiza cuando cambia la sesión en Firebase (necesario en móvil tras redirect / Safari).
 */
export function useFirebaseAuthUid() {
  return useSyncExternalStore(subscribeAuthUid, getAuthUidSnapshot, getServerAuthUidSnapshot)
}

/**
 * @param {import('firebase/auth').User | null} contextUser
 * @returns {import('firebase/auth').User | null}
 */
export function resolveAuthUserForDisplay(contextUser) {
  if (contextUser) return contextUser
  return auth?.currentUser ?? null
}

/**
 * Usuario efectivo para cabecera de perfil: sincroniza re-renders con Firebase Auth.
 *
 * @param {import('firebase/auth').User | null} contextUser
 * @returns {import('firebase/auth').User | null}
 */
export function useAuthUserForProfileHeader(contextUser) {
  useFirebaseAuthUid()
  return resolveAuthUserForDisplay(contextUser)
}
