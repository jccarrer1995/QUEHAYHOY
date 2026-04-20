import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../firebaseConfig.js'

/**
 * @param {{ year: number, monthIndex0: number }}
 * @returns {{ startMs: number, endMs: number }}
 */
function monthBoundsUtc({ year, monthIndex0 }) {
  const start = Date.UTC(year, monthIndex0, 1, 0, 0, 0, 0)
  const end = Date.UTC(year, monthIndex0 + 1, 0, 23, 59, 59, 999)
  return { startMs: start, endMs: end }
}

/**
 * Cuenta eventos del mes calendario actual con `createdByUid` === uid.
 * Filtra en cliente por `createdAt` para no exigir índice compuesto en Firestore.
 *
 * @param {string | null | undefined} organizerUid
 * @returns {{ count: number, loading: boolean, error: string | null }}
 */
export function useOrganizerMonthlyEventCount(organizerUid) {
  const [count, setCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!db || !organizerUid || String(organizerUid).trim() === '') {
      setCount(0)
      setLoading(false)
      setError(null)
      return undefined
    }

    const uid = String(organizerUid).trim()
    let cancelled = false

    async function run() {
      setLoading(true)
      setError(null)
      try {
        const now = new Date()
        const { startMs, endMs } = monthBoundsUtc({
          year: now.getFullYear(),
          monthIndex0: now.getMonth(),
        })

        const q = query(collection(db, 'events'), where('createdByUid', '==', uid))
        const snap = await getDocs(q)
        let n = 0
        snap.forEach((docSnap) => {
          const data = docSnap.data()
          const raw = data.createdAt
          if (raw == null) return
          let ms = 0
          if (typeof raw.toMillis === 'function') {
            ms = raw.toMillis()
          } else if (typeof raw.seconds === 'number') {
            ms = raw.seconds * 1000
          } else {
            return
          }
          if (ms >= startMs && ms <= endMs) n += 1
        })
        if (!cancelled) setCount(n)
      } catch (e) {
        const msg = e && typeof e === 'object' && 'message' in e ? String(e.message) : 'Error al contar eventos'
        if (!cancelled) {
          setError(msg)
          setCount(0)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [organizerUid])

  return { count, loading, error }
}
