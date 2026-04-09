import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CATEGORIES } from '../components/events/CategorySelector.jsx'

const STORAGE_KEY = 'quehayhoy-category-visibility-v1'

const CategoryVisibilityContext = createContext({
  isCategoryVisible: () => true,
  setCategoryVisible: () => {},
  visibleById: {},
})

function normalizeCategoryId(categoryId) {
  if (typeof categoryId !== 'string') return ''
  return categoryId.trim().toLowerCase()
}

function getSelectableCategories() {
  return CATEGORIES.filter((category) => category.id !== 'all')
}

function defaultVisibleMap() {
  /** @type {Record<string, boolean>} */
  const next = {}
  for (const category of getSelectableCategories()) {
    next[normalizeCategoryId(category.id)] = true
  }
  return next
}

function mergeStoredVisible(raw) {
  const def = defaultVisibleMap()
  if (raw == null || typeof raw !== 'object') return def

  const out = { ...def }
  for (const key of Object.keys(def)) {
    if (typeof raw[key] === 'boolean') out[key] = raw[key]
  }
  return out
}

function loadVisibleMap() {
  if (typeof window === 'undefined') return defaultVisibleMap()

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultVisibleMap()
    return mergeStoredVisible(JSON.parse(raw))
  } catch {
    return defaultVisibleMap()
  }
}

function persistVisibleMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function CategoryVisibilityProvider({ children }) {
  const [visibleById, setVisibleById] = useState(() => loadVisibleMap())

  const setCategoryVisible = useCallback((categoryId, visible) => {
    const normalized = normalizeCategoryId(categoryId)
    if (!normalized || normalized === 'all') return

    setVisibleById((prev) => {
      const next = { ...prev, [normalized]: visible }
      persistVisibleMap(next)
      return next
    })
  }, [])

  const isCategoryVisible = useCallback(
    (categoryId) => {
      const normalized = normalizeCategoryId(categoryId)
      if (!normalized || normalized === 'all') return true
      if (!(normalized in visibleById)) return true
      return visibleById[normalized] !== false
    },
    [visibleById]
  )

  const value = useMemo(
    () => ({
      visibleById,
      isCategoryVisible,
      setCategoryVisible,
    }),
    [visibleById, isCategoryVisible, setCategoryVisible]
  )

  return <CategoryVisibilityContext.Provider value={value}>{children}</CategoryVisibilityContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook ligado al provider
export function useCategoryVisibility() {
  return useContext(CategoryVisibilityContext)
}
