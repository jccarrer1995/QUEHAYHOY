import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  arrayUnion,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  Timestamp,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'

const WINDOW_MS = 24 * 60 * 60 * 1000
const MAX_ITEMS = 10
const GUEST_VISTOS_KEY = 'quehayhoy_vistos_guest'

/**
 * @returns {string[]}
 */
function readGuestVistosFromStorage() {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.sessionStorage.getItem(GUEST_VISTOS_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

/**
 * @param {string[]} ids
 */
function writeGuestVistosToStorage(ids) {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(GUEST_VISTOS_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

/**
 * @param {import('firebase/firestore').QueryDocumentSnapshot} d
 */
function mapRecentDoc(d) {
  const data = d.data() ?? {}
  const createdAt = data.createdAt
  let createdAtMs = Date.now()
  if (createdAt && typeof createdAt.toMillis === 'function') {
    createdAtMs = createdAt.toMillis()
  } else if (createdAt && typeof createdAt.seconds === 'number') {
    createdAtMs = createdAt.seconds * 1000
  }
  return {
    id: d.id,
    title: typeof data.title === 'string' ? data.title : 'Evento',
    createdAtMs,
  }
}

/**
 * Notificaciones efímeras: eventos con `createdAt` en la ventana de 24 horas.
 *
 * **Sin login (`userId` vacío):** los “vistos” solo se guardan en `sessionStorage`
 * (`quehayhoy_vistos_guest`). No se lee ni escribe `usuarios/{uid}` en Firestore,
 * así que **no hace falta** definir reglas para esa colección hasta que exista auth.
 *
 * **Con usuario autenticado:** se usa `usuarios/{uid}.vistos` en Firestore; ahí sí
 * necesitarás reglas que permitan a cada usuario leer/escribir solo su documento.
 *
 * @param {string | null | undefined} userId - UID de Firebase Auth, o null si no hay sesión
 */
export function useEphemeralNotifications(userId) {
  const [recentEvents, setRecentEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventsError, setEventsError] = useState(null)
  const [vistosFirestore, setVistosFirestore] = useState([])
  const [guestVistos, setGuestVistos] = useState(() => readGuestVistosFromStorage())
  const [oneDayAgo, setOneDayAgo] = useState(() =>
    Timestamp.fromMillis(Date.now() - WINDOW_MS)
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      setOneDayAgo(Timestamp.fromMillis(Date.now() - WINDOW_MS))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    if (!db) {
      queueMicrotask(() => {
        setEventsLoading(false)
        setEventsError('Firebase no configurado')
        setRecentEvents([])
      })
      return
    }

    queueMicrotask(() => {
      setEventsError(null)
    })

    const colRef = collection(db, 'events')
    const qRecent = query(
      colRef,
      where('isVisible', '==', true),
      where('createdAt', '>=', oneDayAgo),
      orderBy('createdAt', 'desc'),
      limit(MAX_ITEMS)
    )

    const unsub = onSnapshot(
      qRecent,
      (snap) => {
        const list = snap.docs.map(mapRecentDoc)
        queueMicrotask(() => {
          setRecentEvents(list)
          setEventsLoading(false)
          setEventsError(null)
        })
      },
      (err) => {
        queueMicrotask(() => {
          setEventsError(err?.message ?? 'Error al escuchar eventos recientes')
          setRecentEvents([])
          setEventsLoading(false)
        })
      }
    )

    return () => unsub()
  }, [oneDayAgo])

  useEffect(() => {
    if (!db || !userId) {
      queueMicrotask(() => setVistosFirestore([]))
      return
    }

    const ref = doc(db, 'usuarios', userId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const data = snap.data()
        const v = data?.vistos
        const arr = Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []
        queueMicrotask(() => setVistosFirestore(arr))
      },
      () => {
        queueMicrotask(() => setVistosFirestore([]))
      }
    )
    return () => unsub()
  }, [userId])

  const seenIds = useMemo(() => {
    const src = userId ? vistosFirestore : guestVistos
    return new Set(src)
  }, [userId, vistosFirestore, guestVistos])

  const unreadCount = useMemo(() => {
    return recentEvents.filter((e) => !seenIds.has(e.id)).length
  }, [recentEvents, seenIds])

  const markAsSeen = useCallback(
    async (eventId) => {
      if (!eventId) return
      if (userId) {
        if (!db) throw new Error('Firebase no configurado')
        await setDoc(
          doc(db, 'usuarios', userId),
          { vistos: arrayUnion(eventId) },
          { merge: true }
        )
        return
      }
      setGuestVistos((prev) => {
        if (prev.includes(eventId)) return prev
        const next = [...prev, eventId]
        writeGuestVistosToStorage(next)
        return next
      })
    },
    [userId]
  )

  return {
    recentEvents,
    eventsLoading,
    eventsError,
    seenIds,
    unreadCount,
    markAsSeen,
    isLoggedIn: Boolean(userId),
  }
}
