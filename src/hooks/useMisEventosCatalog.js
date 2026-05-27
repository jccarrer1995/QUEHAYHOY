import { useCallback, useEffect, useState } from 'react'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { mapDocToEvent } from './useEvents.js'
import { isAdministratorRole } from '../lib/organizerPlans.js'

const MIS_EVENTOS_FETCH_LIMIT = 400

/**
 * Eventos para la página «Mis eventos»: todos si administrador, solo `createdByUid` si organizador.
 *
 * @param {{
 *   uid: string | null | undefined,
 *   role: string | null | undefined,
 *   enabled: boolean,
 *   scope?: 'all' | 'createdThisMonth',
 * }}
 */
export function useMisEventosCatalog({ uid, role, enabled, scope = 'all' }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadToken, setReloadToken] = useState(0)

  const refetch = useCallback(() => {
    setReloadToken((t) => t + 1)
  }, [])

  useEffect(() => {
    if (!enabled || !db) {
      setEvents([])
      setLoading(false)
      setError(null)
      return undefined
    }

    const isAdmin = isAdministratorRole(role)
    const organizerUid = typeof uid === 'string' && uid.trim() !== '' ? uid.trim() : ''

    if (!isAdmin && !organizerUid) {
      setEvents([])
      setLoading(false)
      setError(null)
      return undefined
    }

    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const col = collection(db, 'events')
        const q = isAdmin
          ? query(col, limit(MIS_EVENTOS_FETCH_LIMIT))
          : query(col, where('createdByUid', '==', organizerUid), limit(MIS_EVENTOS_FETCH_LIMIT))
        const snap = await getDocs(q)
        if (cancelled) return
        const list = snap.docs.map((d) => mapDocToEvent(d))
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth()
        const filtered =
          scope === 'createdThisMonth'
            ? list.filter((event) => {
                if (typeof event.createdAtMs !== 'number' || !Number.isFinite(event.createdAtMs)) return false
                const createdAt = new Date(event.createdAtMs)
                return createdAt.getFullYear() === currentYear && createdAt.getMonth() === currentMonth
              })
            : list
        filtered.sort((a, b) => (b.dateMs ?? 0) - (a.dateMs ?? 0))
        setEvents(filtered)
      } catch (e) {
        const msg =
          e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Error al cargar eventos'
        if (!cancelled) {
          setError(msg)
          setEvents([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [uid, role, enabled, scope, reloadToken])

  return { events, loading, error, refetch }
}
