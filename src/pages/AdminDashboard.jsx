import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  serverTimestamp,
  documentId,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext'
import { isAdministratorRole } from '../lib/organizerPlans.js'
import { ArrowLeft, Moon, Pencil, Plus, Sun, Trash2 } from 'lucide-react'

const PAGE_SIZE = 10

/**
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
function formatRowDate(data) {
  const isRecurring =
    data.type === 'recurring' || data.eventType === 'recurring'
  if (isRecurring) return 'Recurrente'
  const d = data.date
  if (d && typeof d.toDate === 'function') {
    return d.toDate().toLocaleDateString('es-EC', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }
  return '—'
}

/**
 * @param {Record<string, unknown>} data
 * @returns {string}
 */
function rowTypeLabel(data) {
  if (data.type === 'recurring' || data.eventType === 'recurring') return 'Recurrente'
  return 'Único'
}

/**
 * @param {Record<string, unknown>} data
 * @returns {number}
 */
function getExpirationMs(data) {
  const isRecurring = data.type === 'recurring' || data.eventType === 'recurring'
  const expiration = isRecurring ? data.active_until : (data.endDate ?? data.date)
  if (expiration && typeof expiration.toMillis === 'function') return expiration.toMillis()
  if (expiration && typeof expiration.seconds === 'number') return expiration.seconds * 1000
  return Number.POSITIVE_INFINITY
}

/**
 * @param {Record<string, unknown>} data
 * @returns {boolean}
 */
function isExpired(data) {
  return getExpirationMs(data) < Date.now()
}

export function AdminDashboard() {
  const { theme, toggleTheme } = useTheme()
  const { user, profile } = useAuth()
  const isDark = theme === 'dark'
  const isAdmin = isAdministratorRole(profile?.role)

  const [pageIndex, setPageIndex] = useState(0)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [hasNext, setHasNext] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [togglingId, setTogglingId] = useState(null)

  const lastDocPerPageRef = useRef([])

  const loadPage = useCallback(async () => {
    if (!db) {
      setLoading(false)
      setError('Firebase no configurado')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const col = collection(db, 'events')
      const take = PAGE_SIZE + 1
      const organizerUid = user?.uid ? String(user.uid).trim() : ''
      if (!isAdmin && !organizerUid) {
        setError('No se pudo identificar al organizador.')
        setRows([])
        setLoading(false)
        return
      }
      let q
      if (isAdmin) {
        if (pageIndex === 0) {
          q = query(col, orderBy(documentId()), limit(take))
        } else {
          const prevLast = lastDocPerPageRef.current[pageIndex - 1]
          if (!prevLast) {
            setPageIndex(0)
            return
          }
          q = query(col, orderBy(documentId()), startAfter(prevLast), limit(take))
        }
      } else {
        if (pageIndex === 0) {
          q = query(col, where('createdByUid', '==', organizerUid), orderBy(documentId()), limit(take))
        } else {
          const prevLast = lastDocPerPageRef.current[pageIndex - 1]
          if (!prevLast) {
            setPageIndex(0)
            return
          }
          q = query(
            col,
            where('createdByUid', '==', organizerUid),
            orderBy(documentId()),
            startAfter(prevLast),
            limit(take)
          )
        }
      }
      const snap = await getDocs(q)
      let docs = snap.docs
      const more = docs.length > PAGE_SIZE
      if (more) docs = docs.slice(0, PAGE_SIZE)
      const last = docs.length > 0 ? docs[docs.length - 1] : null
      lastDocPerPageRef.current[pageIndex] = last
      setHasNext(more)
      setRows(
        docs
          .map((d) => {
          const data = d.data()
          return {
            id: d.id,
            title: typeof data.title === 'string' ? data.title : 'Sin título',
            category: typeof data.category === 'string' ? data.category : '—',
            sector:
              typeof data.sector === 'string'
                ? data.sector
                : typeof data.location === 'string'
                  ? data.location
                  : '—',
            typeLabel: rowTypeLabel(data),
            dateLabel: formatRowDate(data),
            isVisible: typeof data.isVisible === 'boolean' ? data.isVisible : true,
            isExpired: isExpired(data),
            expirationMs: getExpirationMs(data),
          }
          })
          .sort((a, b) => {
            if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1
            return a.expirationMs - b.expirationMs
          })
      )
    } catch (e) {
      setError(e?.message ?? 'Error al cargar eventos')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [pageIndex, isAdmin, user?.uid])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  async function handleDelete(id) {
    if (!db || !id) return
    const ok = window.confirm('¿Eliminar este evento? Esta acción no se puede deshacer.')
    if (!ok) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteDoc(doc(db, 'events', id))
      await loadPage()
    } catch (e) {
      setError(e?.message ?? 'No se pudo eliminar')
    } finally {
      setDeletingId(null)
    }
  }

  async function handleToggleVisibility(id, nextVisible) {
    if (!db || !id) return
    setTogglingId(id)
    setError(null)
    const prevRows = rows
    setRows((current) =>
      current.map((r) => (r.id === id ? { ...r, isVisible: nextVisible } : r))
    )
    try {
      await updateDoc(doc(db, 'events', id), {
        isVisible: nextVisible,
        updatedAt: serverTimestamp(),
      })
    } catch (e) {
      setRows(prevRows)
      setError(e?.message ?? 'No se pudo actualizar el estado')
    } finally {
      setTogglingId(null)
    }
  }

  const headerBg = isDark ? 'border-gray-800 bg-[#121212]' : 'border-gray-200 bg-white'
  const mainBg = isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'
  const tableWrap = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-white'
  const thCl = isDark ? 'text-gray-400' : 'text-gray-600'
  const tdCl = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'
  const muted = isDark ? 'text-gray-500' : 'text-gray-500'

  return (
    <div className={`min-h-screen ${mainBg}`}>
      <header className={`sticky top-0 z-20 border-b ${headerBg}`}>
        <div className="mx-auto max-w-6xl px-4 py-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className={`p-2 -ml-2 rounded-lg transition-colors flex-shrink-0 ${
                isDark ? 'text-[#E0E0E0] hover:text-white' : 'text-gray-700 hover:text-gray-900'
              }`}
              aria-label="Volver al sitio"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <h1
                className="text-lg font-bold truncate"
                style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}
              >
                Administración de eventos
              </h1>
              <p
                className="text-sm truncate"
                style={{ color: isDark ? '#9ca3af' : '#4b5563' }}
              >
                Listado, crear, editar y eliminar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-gray-700 text-amber-200 hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
              aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? 'Claro' : 'Oscuro'}
            </button>
            <Link
              to="/mis-eventos/crear"
              className="inline-flex items-center gap-2 rounded-xl bg-[#14b8a6] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#14b8a6]/20 hover:bg-[#0d9488] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Crear evento
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-24">
        {error && (
          <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
              isDark
                ? 'border-red-800 bg-red-950/40 text-red-300'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {error}
          </div>
        )}

        <div className={`rounded-2xl border overflow-hidden shadow-sm ${tableWrap}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-800 bg-[#1a1a1a]' : 'border-gray-200 bg-gray-50'}`}>
                  <th className={`px-4 py-3 font-semibold ${thCl}`}>Título</th>
                  <th className={`px-4 py-3 font-semibold ${thCl} hidden sm:table-cell`}>Categoría</th>
                  <th className={`px-4 py-3 font-semibold ${thCl}`}>Tipo</th>
                  <th className={`px-4 py-3 font-semibold ${thCl}`}>Estado</th>
                  <th className={`px-4 py-3 font-semibold ${thCl} hidden md:table-cell`}>Sector</th>
                  <th className={`px-4 py-3 font-semibold ${thCl} hidden lg:table-cell`}>Fecha</th>
                  <th className={`px-4 py-3 font-semibold ${thCl} text-right w-[120px]`}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-16 text-center ${muted}`}>
                      Cargando…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={`px-4 py-16 text-center ${muted}`}>
                      No hay eventos. Crea el primero con &quot;Crear evento&quot;.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b last:border-0 ${
                        isDark ? 'border-gray-800 hover:bg-[#1f1f1f]' : 'border-gray-100 hover:bg-gray-50'
                      } ${r.isVisible ? '' : 'opacity-50'} ${r.isExpired ? (isDark ? 'bg-gray-900/50 text-gray-400' : 'bg-gray-100 text-gray-500') : ''}`}
                    >
                      <td className={`px-4 py-3 font-medium ${tdCl} max-w-[200px] truncate`}>{r.title}</td>
                      <td className={`px-4 py-3 ${muted} hidden sm:table-cell`}>{r.category}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            r.typeLabel === 'Recurrente'
                              ? isDark
                                ? 'bg-violet-900/50 text-violet-200'
                                : 'bg-violet-100 text-violet-800'
                              : isDark
                                ? 'bg-teal-900/40 text-teal-200'
                                : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {r.typeLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={r.isVisible}
                            disabled={togglingId === r.id}
                            onChange={(e) => handleToggleVisibility(r.id, e.target.checked)}
                            aria-label={`Cambiar estado de ${r.title}`}
                          />
                          <span
                            className={`relative h-6 w-11 rounded-full transition-colors ${
                              r.isVisible ? 'bg-[#14b8a6]' : isDark ? 'bg-gray-700' : 'bg-gray-300'
                            } ${togglingId === r.id ? 'opacity-70' : ''}`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                r.isVisible ? 'left-[22px]' : 'left-0.5'
                              }`}
                            />
                          </span>
                        </label>
                      </td>
                      <td className={`px-4 py-3 ${muted} hidden md:table-cell max-w-[140px] truncate`}>
                        {r.sector}
                      </td>
                      <td className={`px-4 py-3 ${muted} hidden lg:table-cell whitespace-nowrap`}>
                        <span className="inline-flex items-center gap-2">
                          <span>{r.dateLabel}</span>
                          {r.isExpired ? (
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              isDark ? 'bg-red-900/50 text-red-200' : 'bg-red-100 text-red-700'
                            }`}>
                              Vencido
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          <Link
                            to={`/wp-admin/editar/${r.id}`}
                            className={`inline-flex p-2 rounded-lg transition-colors ${
                              isDark
                                ? 'text-[#5eead4] hover:bg-gray-800'
                                : 'text-[#14b8a6] hover:bg-teal-50'
                            }`}
                            aria-label={`Editar ${r.title}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            disabled={deletingId === r.id}
                            onClick={() => handleDelete(r.id)}
                            className={`inline-flex p-2 rounded-lg transition-colors disabled:opacity-50 ${
                              isDark
                                ? 'text-red-400 hover:bg-red-950/50'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            aria-label={`Eliminar ${r.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {!loading && rows.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className={`text-sm ${muted}`}>
              Página {pageIndex + 1}
              {hasNext ? ' · Hay más resultados' : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={pageIndex === 0 || loading}
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                  isDark
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                Anterior
              </button>
              <button
                type="button"
                disabled={!hasNext || loading}
                onClick={() => setPageIndex((p) => p + 1)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 ${
                  isDark
                    ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
                }`}
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDashboard
