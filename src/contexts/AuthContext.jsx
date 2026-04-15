import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged,
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { toast } from 'sonner'
import { auth, db, missingFirebaseEnvKeys } from '../firebaseConfig.js'
import { shouldUseGoogleRedirect } from '../lib/shouldUseGoogleRedirect.js'

const FIREBASE_AUTH_SETUP_MSG =
  'En Firebase Console: abre Authentication y pulsa "Comenzar" si aún no está activo; en la pestaña "Sign-in method" habilita el proveedor Google. En Google Cloud, la API "Identity Toolkit API" debe estar habilitada para el proyecto (suele activarse al usar Auth).'

const USERS_COLLECTION = 'users'
const DEFAULT_ROLE = 'Asistente'
const AUTH_RETURN_PATH_KEY = 'qh_auth_return'
/** Solo se navega de vuelta si el login fue por `signInWithRedirect` (móvil); el popup de desktop no debe tocar esto. */
const AUTH_OAUTH_PENDING_KEY = 'qh_oauth_return_pending'

function saveAuthReturnPath() {
  try {
    if (typeof window === 'undefined') return
    sessionStorage.setItem(
      AUTH_RETURN_PATH_KEY,
      `${window.location.pathname}${window.location.search}`
    )
    sessionStorage.setItem(AUTH_OAUTH_PENDING_KEY, '1')
  } catch {
    // modo privado o quota
  }
}

function buildGoogleProvider() {
  const p = new GoogleAuthProvider()
  p.setCustomParameters({ prompt: 'select_account' })
  return p
}

/** Mensaje claro cuando Firebase bloquea el origen (p. ej. IP de LAN no listada en dominios autorizados). */
function notifyGoogleRedirectFailure(err) {
  const code =
    err && typeof err === 'object' && 'code' in err
      ? String(/** @type {{ code?: string }} */ (err).code)
      : ''
  const host = typeof window !== 'undefined' ? window.location.hostname : ''

  console.error('Google sign-in redirect:', err)

  if (code === 'auth/unauthorized-domain') {
    toast.error(
      `Firebase no autoriza este origen (${host}). En Firebase Console → Authentication → Configuración → Dominios autorizados, pulsa «Añadir dominio» y escribe solo «${host}» (sin http ni puerto). Es necesario si entras por IP de tu red (p. ej. 192.168.x.x).`,
      { duration: 14_000 }
    )
    return
  }

  toast.error('No se pudo abrir el inicio de sesión con Google.', { duration: 6_000 })
}

/**
 * @typedef {{ role: string, photoURL: string | null, displayName: string | null }} UserProfile
 */

const AuthContext = createContext({
  user: null,
  profile: null,
  role: null,
  photoURL: null,
  displayName: null,
  loading: true,
  signInWithGoogle: async () => {},
  beginGoogleRedirect: () => {},
  signOut: async () => {},
  logout: async () => {},
})

/**
 * Crea el documento en `users/{uid}` si no existe (rol por defecto Asistente).
 * @param {import('firebase/auth').User} firebaseUser
 */
async function ensureUserDocument(firebaseUser) {
  if (!db || !firebaseUser?.uid) return

  const ref = doc(db, USERS_COLLECTION, firebaseUser.uid)
  const snap = await getDoc(ref)

  if (snap.exists()) return

  await setDoc(ref, {
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? null,
    displayName: firebaseUser.displayName ?? null,
    photoURL: firebaseUser.photoURL ?? null,
    role: DEFAULT_ROLE,
    favoriteEventIds: [],
    createdAt: serverTimestamp(),
  })
}

/**
 * @param {string} uid
 * @returns {Promise<UserProfile | null>}
 */
async function fetchUserProfile(uid) {
  if (!db || !uid) return null

  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  if (!snap.exists()) return null

  const d = snap.data()
  const role = typeof d.role === 'string' && d.role.trim() !== '' ? d.role.trim() : DEFAULT_ROLE
  const photoURL = typeof d.photoURL === 'string' ? d.photoURL : null
  const displayName = typeof d.displayName === 'string' ? d.displayName : null

  return { role, photoURL, displayName }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  /** @type {[UserProfile | null, import('react').Dispatch<import('react').SetStateAction<UserProfile | null>>]} */
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false
    if (!auth) {
      setLoading(false)
      return undefined
    }

    let unsubscribe = () => {}

    const consumeReturnPath = () => {
      try {
        const pending = sessionStorage.getItem(AUTH_OAUTH_PENDING_KEY)
        const target = sessionStorage.getItem(AUTH_RETURN_PATH_KEY)
        if (pending !== '1') {
          if (target) sessionStorage.removeItem(AUTH_RETURN_PATH_KEY)
          return
        }
        sessionStorage.removeItem(AUTH_OAUTH_PENDING_KEY)
        sessionStorage.removeItem(AUTH_RETURN_PATH_KEY)
        if (!target) return
        const current = `${window.location.pathname}${window.location.search}`
        if (target !== current) {
          navigate(target, { replace: true })
        }
      } catch {
        // ignore
      }
    }

    /**
     * Alinea React con `auth.currentUser` (sesión persistida o tras OAuth).
     * En móvil/Safari, `getRedirectResult` puede no devolver nada pero ya hay usuario;
     * con bfcache al volver de Google los efectos no se re-ejecutan: hace falta `pageshow`.
     */
    const syncSessionFromAuth = async () => {
      if (!auth || cancelledRef.current) return
      const u = auth.currentUser
      if (!u) return
      setUser(u)
      try {
        await ensureUserDocument(u)
        if (db) {
          const p = await fetchUserProfile(u.uid)
          if (!cancelledRef.current) setProfile(p)
        }
      } catch (err) {
        console.error('Error al sincronizar sesión desde Firebase:', err)
        if (!cancelledRef.current) setProfile(null)
      } finally {
        if (!cancelledRef.current) setLoading(false)
      }
      consumeReturnPath()
    }

    /** Tras volver de OAuth (bfcache o recarga), re-alinea estado React con Firebase. */
    const onPageShow = () => {
      if (cancelledRef.current) return
      void syncSessionFromAuth()
    }
    window.addEventListener('pageshow', onPageShow)

    const run = async () => {
      try {
        await auth.authStateReady()
      } catch {
        // ignore
      }
      if (cancelledRef.current) return

      try {
        const result = await getRedirectResult(auth)
        if (!cancelledRef.current && result?.user) {
          setUser(result.user)
          try {
            await ensureUserDocument(result.user)
            if (db) {
              const p = await fetchUserProfile(result.user.uid)
              if (!cancelledRef.current) setProfile(p)
            }
          } catch (err) {
            console.error('Error tras inicio de sesión con Google (redirect):', err)
          }
          consumeReturnPath()
        }
      } catch (err) {
        const code = err && typeof err === 'object' && 'code' in err ? err.code : ''
        if (code !== 'auth/no-auth-event' && code !== 'auth/missing-or-invalid-nonce') {
          console.error('Google redirect:', err)
        }
      }

      if (cancelledRef.current) return

      await syncSessionFromAuth()

      if (cancelledRef.current) return

      unsubscribe = onAuthStateChanged(auth, async (u) => {
        if (cancelledRef.current) return

        if (!u) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        setUser(u)

        try {
          await ensureUserDocument(u)
          const p = await fetchUserProfile(u.uid)
          if (!cancelledRef.current) {
            setProfile(p)
          }
        } catch (err) {
          console.error('Error al cargar perfil de usuario:', err)
          if (!cancelledRef.current) {
            setProfile(null)
          }
        } finally {
          if (!cancelledRef.current) {
            setLoading(false)
          }
        }
      })
    }

    void run()

    return () => {
      cancelledRef.current = true
      window.removeEventListener('pageshow', onPageShow)
      unsubscribe()
    }
  }, [navigate])

  /**
   * Llamar **síncronamente** desde el onClick (sin `await` previo ni `setState` antes) para que Safari iOS
   * no bloquee la navegación del OAuth.
   */
  const beginGoogleRedirect = useCallback(() => {
    if (!auth) {
      const missing = missingFirebaseEnvKeys.join(', ')
      throw new Error(
        missing
          ? `Firebase no está inicializado: faltan en .env → ${missing}. Copia todos los valores del snippet "firebaseConfig" en Firebase Console (⚙️ Configuración del proyecto → Tus apps → Web).`
          : `Firebase Auth no está disponible. ${FIREBASE_AUTH_SETUP_MSG}`
      )
    }
    saveAuthReturnPath()
    void signInWithRedirect(auth, buildGoogleProvider()).catch((e) => {
      notifyGoogleRedirectFailure(e)
    })
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) {
      const missing = missingFirebaseEnvKeys.join(', ')
      throw new Error(
        missing
          ? `Firebase no está inicializado: faltan en .env → ${missing}. Copia todos los valores del snippet "firebaseConfig" en Firebase Console (⚙️ Configuración del proyecto → Tus apps → Web).`
          : `Firebase Auth no está disponible. ${FIREBASE_AUTH_SETUP_MSG}`
      )
    }

    try {
      if (shouldUseGoogleRedirect()) {
        beginGoogleRedirect()
        return
      }

      let credential
      try {
        credential = await signInWithPopup(auth, buildGoogleProvider())
      } catch (popupErr) {
        const code =
          popupErr && typeof popupErr === 'object' && 'code' in popupErr ? popupErr.code : ''
        if (
          code === 'auth/popup-blocked' ||
          code === 'auth/operation-not-supported-in-this-environment'
        ) {
          saveAuthReturnPath()
          await signInWithRedirect(auth, buildGoogleProvider())
          return
        }
        throw popupErr
      }

      setUser(credential.user)
      await ensureUserDocument(credential.user)

      if (db) {
        const p = await fetchUserProfile(credential.user.uid)
        setProfile(p)
      }
    } catch (err) {
      console.error('Error al iniciar sesión con Google:', err)
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'auth/unauthorized-domain'
      ) {
        notifyGoogleRedirectFailure(err)
      }
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        err.code === 'auth/configuration-not-found'
      ) {
        throw new Error(
          `Firebase no encuentra la configuración de Authentication (auth/configuration-not-found). ` +
            `1) Revisa que .env tenga VITE_FIREBASE_AUTH_DOMAIN (ej. tu-proyecto.firebaseapp.com) y VITE_FIREBASE_APP_ID exactamente como en la consola. ` +
            `2) ${FIREBASE_AUTH_SETUP_MSG}`,
          { cause: err }
        )
      }
      throw err
    }
  }, [beginGoogleRedirect])

  const logout = useCallback(async () => {
    if (!auth) return
    await firebaseSignOut(auth)
    setProfile(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      role: profile?.role ?? null,
      photoURL: profile?.photoURL ?? user?.photoURL ?? null,
      displayName: profile?.displayName ?? user?.displayName ?? null,
      loading,
      signInWithGoogle,
      beginGoogleRedirect,
      signOut: logout,
      logout,
    }),
    [user, profile, loading, signInWithGoogle, beginGoogleRedirect, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook ligado al provider
export function useAuth() {
  return useContext(AuthContext)
}
