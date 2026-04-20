import { useEffect, useState } from 'react'
import { collection, getDocs, limit, query, where } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { mapDocToEvent } from './useEvents.js'
import { isAdministratorRole } from '../lib/organizerPlans.js'

const MIS_EVENTOS_FETCH_LIMIT = 400

/**
 * Eventos para la página «Mis eventos»: todos si administrador, solo `createdByUid` si organizador.
 *
 * @param {{ uid: string | null | undefined, role: string | null | undefined, enabled: boolean }}
 */
export function useMisEventosCatalog({ uid, role, enabled }) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        list.sort((a, b) => (b.dateMs ?? 0) - (a.dateMs ?? 0))
        setEvents(list)
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
  }, [uid, role, enabled])

  return { events, loading, error }
}
