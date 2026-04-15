import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { useAuth } from './AuthContext.jsx'

const LOCAL_STORAGE_KEY = 'favoritos_qhhy'
const USERS_COLLECTION = 'users'

const FavoriteEventsContext = createContext({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  favoritesLoading: false,
})

function normalizeFavoriteIds(raw) {
  if (!Array.isArray(raw)) return []

  /** @type {string[]} */
  const ids = []
  const seen = new Set()

  for (const item of raw) {
    const id = typeof item === 'string' || typeof item === 'number' ? String(item).trim() : ''
    if (!id || seen.has(id)) continue
    seen.add(id)
    ids.push(id)
  }

  return ids
}

function loadLocalFavoriteIds() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return []
    return normalizeFavoriteIds(JSON.parse(raw))
  } catch {
    return []
  }
}

function clearLocalFavoriteStorage() {
  try {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function FavoriteEventsProvider({ children }) {
  const { user, loading: authLoading } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user?.uid || !db) {
      setFavoriteIds([])
      setHydrated(true)
      return
    }

    let cancelled = false
    setHydrated(false)

    ;(async () => {
      try {
        const ref = doc(db, USERS_COLLECTION, user.uid)
        const snap = await getDoc(ref)
        let remote = normalizeFavoriteIds(snap.data()?.favoriteEventIds)
        const local = loadLocalFavoriteIds()

        if (local.length > 0) {
          const merged = normalizeFavoriteIds([...remote, ...local])
          await setDoc(ref, { favoriteEventIds: merged }, { merge: true })
          clearLocalFavoriteStorage()
          remote = merged
        }

        if (!cancelled) setFavoriteIds(remote)
      } catch (err) {
        console.error('FavoriteEvents: error al cargar favoritos', err)
        if (!cancelled) setFavoriteIds([])
      } finally {
        if (!cancelled) setHydrated(true)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.uid, authLoading])

  const favoritesLoading = authLoading || !hydrated

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const isFavorite = useCallback(
    (eventId) => {
      const id = typeof eventId === 'string' || typeof eventId === 'number' ? String(eventId).trim() : ''
      if (!id) return false
      return favoriteIdSet.has(id)
    },
    [favoriteIdSet]
  )

  const toggleFavorite = useCallback(
    (eventId) => {
      const id = typeof eventId === 'string' || typeof eventId === 'number' ? String(eventId).trim() : ''
      if (!id || !user?.uid || !db) return

      setFavoriteIds((prev) => {
        const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        void setDoc(doc(db, USERS_COLLECTION, user.uid), { favoriteEventIds: next }, { merge: true }).catch(
          (err) => console.error('FavoriteEvents: error al guardar', err)
        )
        return next
      })
    },
    [user?.uid]
  )

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      favoritesLoading,
    }),
    [favoriteIds, isFavorite, toggleFavorite, favoritesLoading]
  )

  return <FavoriteEventsContext.Provider value={value}>{children}</FavoriteEventsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook ligado al provider
export function useFavoriteEvents() {
  return useContext(FavoriteEventsContext)
}
