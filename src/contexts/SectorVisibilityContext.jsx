import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { SECTORS } from '../lib/topSectors.js'

const STORAGE_KEY = 'quehayhoy-sector-visibility-v1'

const SectorVisibilityContext = createContext({
  isSectorVisible: () => true,
  setSectorVisible: () => {},
  visibleById: {},
})

/**
 * @returns {Record<string, boolean>}
 */
function defaultVisibleMap() {
  /** @type {Record<string, boolean>} */
  const m = {}
  for (const s of SECTORS) {
    if (s.id !== 'all') m[s.id] = true
  }
  return m
}

/**
 * @param {unknown} raw
 * @returns {Record<string, boolean>}
 */
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

/**
 * @param {Record<string, boolean>} map
 */
function persistVisibleMap(map) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    /* ignore */
  }
}

export function SectorVisibilityProvider({ children }) {
  const [visibleById, setVisibleById] = useState(() => loadVisibleMap())

  const setSectorVisible = useCallback((sectorId, visible) => {
    if (sectorId === 'all') return
    setVisibleById((prev) => {
      const next = { ...prev, [sectorId]: visible }
      persistVisibleMap(next)
      return next
    })
  }, [])

  const isSectorVisible = useCallback(
    (sectorId) => {
      if (sectorId === 'all') return true
      return visibleById[sectorId] !== false
    },
    [visibleById]
  )

  const value = useMemo(
    () => ({
      visibleById,
      isSectorVisible,
      setSectorVisible,
    }),
    [visibleById, isSectorVisible, setSectorVisible]
  )

  return <SectorVisibilityContext.Provider value={value}>{children}</SectorVisibilityContext.Provider>
}

/** @returns {import('react').ContextType<typeof SectorVisibilityContext>} */
// eslint-disable-next-line react-refresh/only-export-components -- hook ligado al provider
export function useSectorVisibility() {
  return useContext(SectorVisibilityContext)
}
