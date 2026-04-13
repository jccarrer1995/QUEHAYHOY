import { useCallback, useState } from 'react'
import { shouldUseGoogleRedirect } from '../../lib/shouldUseGoogleRedirect.js'

/**
 * Misma lógica que el inicio de sesión Google en `DesktopProfileMenuContent.jsx`
 * (`handleGoogleClick` / `handleGooglePopup`). Si el drawer desktop cambia, actualiza aquí.
 *
 * @param {{ signInWithGoogle: () => Promise<unknown>, beginGoogleRedirect: () => void }} params
 */
export function useProfileGoogleSignIn({ signInWithGoogle, beginGoogleRedirect }) {
  const [googleBusy, setGoogleBusy] = useState(false)

  const handleGooglePopup = useCallback(async () => {
    setGoogleBusy(true)
    try {
      await signInWithGoogle()
    } catch {
      // AuthContext ya loguea
    } finally {
      setGoogleBusy(false)
    }
  }, [signInWithGoogle])

  const handleGoogleClick = useCallback(() => {
    if (shouldUseGoogleRedirect()) {
      try {
        beginGoogleRedirect()
      } catch (err) {
        console.error(err)
      }
      return
    }
    void handleGooglePopup()
  }, [beginGoogleRedirect, handleGooglePopup])

  return { handleGoogleClick, handleGooglePopup, googleBusy }
}
