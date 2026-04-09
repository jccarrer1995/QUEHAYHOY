import { createContext, useCallback, useContext, useMemo, useState } from 'react'

const STORAGE_KEY = 'favoritos_qhhy'

const FavoriteEventsContext = createContext({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
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

function loadFavoriteIds() {
  if (typeof window === 'undefined') return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return normalizeFavoriteIds(JSON.parse(raw))
  } catch {
    return []
  }
}

function persistFavoriteIds(ids) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

export function FavoriteEventsProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState(() => loadFavoriteIds())

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds])

  const isFavorite = useCallback(
    (eventId) => {
      const id = typeof eventId === 'string' || typeof eventId === 'number' ? String(eventId).trim() : ''
      if (!id) return false
      return favoriteIdSet.has(id)
    },
    [favoriteIdSet]
  )

  const toggleFavorite = useCallback((eventId) => {
    const id = typeof eventId === 'string' || typeof eventId === 'number' ? String(eventId).trim() : ''
    if (!id) return

    setFavoriteIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      persistFavoriteIds(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteIds, isFavorite, toggleFavorite]
  )

  return <FavoriteEventsContext.Provider value={value}>{children}</FavoriteEventsContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook ligado al provider
export function useFavoriteEvents() {
  return useContext(FavoriteEventsContext)
}
