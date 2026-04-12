/**
 * `signInWithPopup` suele fallar en Safari iOS, WebViews y muchos navegadores móviles.
 * En esos casos conviene `signInWithRedirect`.
 */
export function shouldUseGoogleRedirect() {
  if (typeof window === 'undefined') return false

  const ua = navigator.userAgent || ''
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i.test(ua)) return true
  // Chrome / Firefox / Edge en iOS (popup inestable; el redirect debe dispararse en el mismo gesto del clic)
  if (/CriOS|FxiOS|EdgiOS|OPT\/|GSA\//i.test(ua)) return true
  // iPadOS se identifica a veces como Mac con touch
  if (/iPad|Macintosh/i.test(ua) && (navigator.maxTouchPoints ?? 0) > 1) return true

  try {
    if (window.matchMedia('(max-width: 767px)').matches) return true
  } catch {
    // matchMedia no disponible
  }

  return false
}
