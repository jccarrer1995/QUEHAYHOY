/**
 * Flujo unificado con desktop: siempre se intenta `signInWithPopup` (ventana / pestaña de OAuth).
 * Si el navegador bloquea el popup o no lo admite, `AuthContext.signInWithGoogle` usa
 * `signInWithRedirect` como respaldo (`auth/popup-blocked`, `auth/operation-not-supported-in-this-environment`).
 */
export function shouldUseGoogleRedirect() {
  return false
}
