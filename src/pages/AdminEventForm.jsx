/**
 * Formulario admin: crear (/wp-admin/nuevo, /mis-eventos/crear) o editar (/wp-admin/editar/:eventId)
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext.jsx'
import { isAdministratorRole } from '../lib/organizerPlans.js'
import { CATEGORIES } from '../components/events/CategorySelector'
import { SECTORS } from '../components/events/SectorSelector'
import {
  initialForm,
  BADGE_LABELS,
  mapFirestoreDocToForm,
  buildEventPayload,
  SECTOR_TO_FIRESTORE,
  DESCRIPTION_MAX_LENGTH,
} from './admin/eventAdminUtils.js'
import { ensureUniqueEventSlug } from '../lib/slug.js'
import { geocodeAddressString } from '../lib/geocodeFromAddress.js'

/**
 * Fecha local de hoy en formato `YYYY-MM-DD` (input type="date").
 * @returns {string}
 */
function getTodayYmdLocal() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @param {{ embeddedInMisEventos?: boolean }} props
 * Si es true, se oculta la cabecera propia del admin y al guardar se vuelve a `/mis-eventos`.
 */
export function AdminEventForm({ embeddedInMisEventos = false }) {
  const { eventId } = useParams()
  const isEdit = Boolean(eventId)
  const navigate = useNavigate()
  const { user, role, loading: authLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const labelCl = isDark ? 'text-gray-200' : 'text-gray-800'
  const mutedCl = isDark ? 'text-gray-400' : 'text-gray-600'

  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [loadingDoc, setLoadingDoc] = useState(isEdit)
  const [loadError, setLoadError] = useState(null)
  const [error, setError] = useState(null)
  const [toastError, setToastError] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  const todayYmdMin = getTodayYmdLocal()

  const showError = (message) => {
    setError(message)
    setToastError(message)
  }

  function toDateTime(dateStr, timeStr, fallbackToEndOfDay = false) {
    if (!dateStr) return null
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!timeStr) {
      const fallbackHour = fallbackToEndOfDay ? 23 : 0
      const fallbackMin = fallbackToEndOfDay ? 59 : 0
      const fallbackSec = fallbackToEndOfDay ? 59 : 0
      const fallbackMs = fallbackToEndOfDay ? 999 : 0
      return new Date(year, month - 1, day, fallbackHour, fallbackMin, fallbackSec, fallbackMs)
    }
    const [hour, min] = timeStr.split(':').map(Number)
    return new Date(year, month - 1, day, hour, min, 0, 0)
  }

  useEffect(() => {
    if (!isEdit || !eventId || !db) {
      setLoadingDoc(false)
      return
    }
    if (authLoading) {
      setLoadingDoc(true)
      return
    }
    let cancelled = false
    setLoadingDoc(true)
    setLoadError(null)
    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'events', eventId))
        if (cancelled) return
        if (!snap.exists()) {
          setLoadError('Evento no encontrado')
          return
        }
        const data = snap.data() ?? {}
        if (!isAdministratorRole(role)) {
          const ownerUid = typeof data.createdByUid === 'string' ? data.createdByUid.trim() : ''
          const uid = user?.uid ? String(user.uid).trim() : ''
          if (ownerUid && ownerUid !== uid) {
            setLoadError('No tienes permiso para editar este evento.')
            return
          }
          if (!ownerUid) {
            setLoadError(
              'Este evento no tiene dueño registrado. Solo un administrador puede editarlo.'
            )
            return
          }
        }
        setForm(mapFirestoreDocToForm(data))
      } catch (e) {
        if (!cancelled) setLoadError(e?.message ?? 'Error al cargar')
      } finally {
        if (!cancelled) setLoadingDoc(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isEdit, eventId, role, user?.uid, authLoading])

  useEffect(() => {
    if (!toastError) return
    const t = window.setTimeout(() => setToastError(''), 4200)
    return () => window.clearTimeout(t)
  }, [toastError])

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dfyp1q7tl'
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'quehayhoy_images'

  async function uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)

    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      const msg = err.error?.message || `Error al subir: ${res.status}`
      if (msg.toLowerCase().includes('preset') && msg.toLowerCase().includes('not found')) {
        throw new Error('Preset no encontrado. Ve a cloudinary.com/console → Settings → Upload → Add upload preset. Nombre: quehayhoy_images, Signing: Unsigned. O pega la URL abajo.')
      }
      throw new Error(msg)
    }

    const data = await res.json()
    return data.secure_url
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)
    try {
      const secureUrl = await uploadImage(file)
      setForm((prev) => ({ ...prev, imageUrl: secureUrl }))
    } catch (err) {
      showError(err.message ?? 'Error al subir la imagen.')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  async function handleGeocodeFromAddress() {
    const sectorLabel = form.sector ? SECTOR_TO_FIRESTORE[form.sector] ?? '' : ''
    const parts = [form.address?.trim(), sectorLabel, 'Guayaquil', 'Ecuador'].filter(Boolean)
    if (parts.length === 0) {
      showError('Indica dirección o sector para buscar coordenadas.')
      return
    }
    setGeocoding(true)
    setError(null)
    try {
      const { lat, lng } = await geocodeAddressString(parts.join(', '))
      setForm((prev) => ({
        ...prev,
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
      }))
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Error al geocodificar.')
    } finally {
      setGeocoding(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (!form.title?.trim()) {
      showError('El título es obligatorio.')
      setSubmitting(false)
      return
    }
    if (form.title.trim().length > 50) {
      showError('El título no puede superar 50 caracteres.')
      setSubmitting(false)
      return
    }
    const descLen = (form.description || '').trim().length
    if (descLen > DESCRIPTION_MAX_LENGTH) {
      showError(`La descripción no puede superar ${DESCRIPTION_MAX_LENGTH} caracteres.`)
      setSubmitting(false)
      return
    }

    if (!db) {
      showError('Firebase no está configurado.')
      setSubmitting(false)
      return
    }

    const latStr = String(form.latitude ?? '').trim()
    const lngStr = String(form.longitude ?? '').trim()
    if ((latStr === '') !== (lngStr === '')) {
      showError('Latitud y longitud deben ir las dos rellenas o las dos vacías.')
      setSubmitting(false)
      return
    }

    if (form.eventType === 'unique') {
      if (!form.date) {
        showError('La fecha de inicio es obligatoria para eventos únicos.')
        setSubmitting(false)
        return
      }
      if (!form.endDate) {
        showError('La Fecha y Hora de Finalización es obligatoria para eventos únicos.')
        setSubmitting(false)
        return
      }
      const todayYmd = getTodayYmdLocal()
      if (form.date < todayYmd) {
        showError('La fecha de inicio no puede ser anterior a hoy.')
        setSubmitting(false)
        return
      }
      if (form.endDate < todayYmd) {
        showError('La fecha de fin no puede ser anterior a hoy.')
        setSubmitting(false)
        return
      }
      const startAt = toDateTime(form.date, form.time, false)
      const endAt = toDateTime(form.endDate, form.endTime, true)
      if (startAt && endAt && endAt.getTime() < startAt.getTime()) {
        showError('La fecha de fin no puede ser anterior a la fecha de inicio.')
        setSubmitting(false)
        return
      }
    }

    try {
      const slug = await ensureUniqueEventSlug(db, form, isEdit ? eventId : null)
      const payload = buildEventPayload(form, {
        isUpdate: isEdit,
        slug,
        organizerUid: !isEdit && user?.uid ? user.uid : null,
      })
      if (isEdit && eventId) {
        await updateDoc(doc(db, 'events', eventId), payload)
      } else {
        await addDoc(collection(db, 'events'), payload)
      }
      navigate(embeddedInMisEventos ? '/mis-eventos' : '/wp-admin')
    } catch (err) {
      showError(err.message ?? 'Error al guardar el evento.')
    } finally {
      setSubmitting(false)
    }
  }

  const headerBg = isDark ? 'border-gray-800 bg-[#121212]/95' : 'border-gray-200 bg-white/95'

  if (loadingDoc) {
    if (embeddedInMisEventos) {
      return (
        <div className="py-16 text-center">
          <p className={mutedCl}>Cargando evento…</p>
        </div>
      )
    }
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Cargando evento…</p>
      </div>
    )
  }

  if (isEdit && loadError) {
    if (embeddedInMisEventos) {
      return (
        <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
          <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{loadError}</p>
          <Link
            to="/mis-eventos"
            className="rounded-xl bg-[#14b8a6] px-6 py-3 font-semibold text-white"
          >
            Volver a Mis eventos
          </Link>
        </div>
      )
    }
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center px-6 ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
        <p className={`mb-4 text-center ${isDark ? 'text-red-400' : 'text-red-600'}`}>{loadError}</p>
        <Link
          to="/wp-admin"
          className="rounded-xl bg-[#14b8a6] px-6 py-3 font-semibold text-white"
        >
          Volver al listado
        </Link>
      </div>
    )
  }

  const mainClassName = embeddedInMisEventos
    ? 'mx-auto w-full min-w-0 max-w-2xl pb-28 pt-0'
    : 'mx-auto min-w-0 max-w-2xl px-4 py-6 pb-24'

  const formInner = (
    <>
      {!embeddedInMisEventos ? (
        <header className={`sticky top-0 z-10 border-b backdrop-blur ${headerBg}`}>
          <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to="/wp-admin"
                className={`p-2 -ml-2 rounded-lg hover:opacity-80 transition-colors flex-shrink-0 ${isDark ? 'text-gray-300 hover:text-[#E0E0E0]' : 'text-gray-700 hover:text-gray-900'}`}
                aria-label="Volver al listado"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <h1
                className="text-lg font-bold truncate"
                style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}
              >
                {isEdit ? 'Editar evento' : 'Nuevo evento'}
              </h1>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className={`p-2.5 rounded-full flex-shrink-0 transition-colors ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-amber-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
          </div>
        </header>
      ) : null}

      <main className={mainClassName}>
        <form onSubmit={handleSubmit} className="min-w-0 max-w-full space-y-6 overflow-x-clip">
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Título <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Noche de jazz en vivo"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={`mb-1.5 block text-sm font-medium ${labelCl}`}>
              Descripción{' '}
              <span className={`font-normal ${mutedCl}`}>
                (máximo {DESCRIPTION_MAX_LENGTH} caracteres)
              </span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder="Descripción del evento..."
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-transparent focus:ring-2 focus:ring-[#14b8a6] dark:border-gray-600 dark:bg-gray-800 dark:text-[#E0E0E0]"
            />
            <p className={`mt-1.5 text-xs ${mutedCl}`}>
              <span
                className={
                  form.description.length >= DESCRIPTION_MAX_LENGTH
                    ? 'text-amber-600 dark:text-amber-400'
                    : ''
                }
              >
                {form.description.length}
              </span>
              {' / '}
              {DESCRIPTION_MAX_LENGTH}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
                Categoría
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
              >
                {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="sector" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                value={form.sector}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
              >
                {SECTORS.filter((s) => s.id !== 'all').map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="price" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Precio ($)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={handleChange}
              placeholder="0 = Gratis"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label htmlFor="badgeType" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Etiqueta
            </label>
            <select
              id="badgeType"
              name="badgeType"
              value={form.badgeType}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            >
              {BADGE_LABELS.map((l) => (
                <option key={l.value === '' ? 'none' : l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="popularidad" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Popularidad (fueguitos 🔥)
            </label>
            <select
              id="popularidad"
              name="popularidad"
              value={form.popularidad}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            >
              <option value="1">🔥</option>
              <option value="2">🔥🔥</option>
              <option value="3">🔥🔥🔥</option>
            </select>
          </div>

          <div>
            <label htmlFor="imageFile" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Imagen del evento
            </label>
            <input
              id="imageFile"
              name="imageFile"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#14b8a6] file:text-white focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none disabled:opacity-60"
            />
            {uploadingImage && (
              <p className={`mt-2 text-sm ${mutedCl}`}>Subiendo imagen…</p>
            )}
            <p className={`mt-2 text-xs ${mutedCl}`}>
              O pega la URL de la imagen (si la subida falla):
            </p>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://res.cloudinary.com/..."
              className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] text-sm placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            />
            {form.imageUrl && !uploadingImage && (
              <div className="mt-3">
                <img
                  src={form.imageUrl}
                  alt="Vista previa"
                  className="w-full max-w-xs h-32 object-cover rounded-xl border border-gray-200 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="address" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Dirección (para Maps)
            </label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="Ej: Av. Víctor Emilio Estrada 123"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            />
            <p className={`mt-2 text-xs ${mutedCl}`}>
              Usa el botón de abajo para rellenar latitud y longitud desde esta dirección y el sector
              seleccionado (requiere API Geocoding en Google Cloud).
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className={`text-sm font-medium ${labelCl}`}>Ubicación en el mapa (Explorar)</p>
              <button
                type="button"
                onClick={handleGeocodeFromAddress}
                disabled={geocoding || submitting}
                className="inline-flex items-center justify-center rounded-xl bg-[#14b8a6] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0d9488] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {geocoding ? 'Buscando…' : 'Obtener coordenadas desde dirección'}
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="latitude" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
                  Latitud
                </label>
                <input
                  id="latitude"
                  name="latitude"
                  type="text"
                  inputMode="decimal"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="-2.189413"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label htmlFor="longitude" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
                  Longitud
                </label>
                <input
                  id="longitude"
                  name="longitude"
                  type="text"
                  inputMode="decimal"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="-79.889483"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
                />
              </div>
            </div>
            <p className={`text-xs ${mutedCl}`}>
              Opcional: si las dejas vacías, en el mapa público se usa una posición aproximada por sector.
              Decimales con punto (ej. -2.1572).
            </p>
          </div>

          <div className="min-w-0 max-w-full space-y-4 overflow-x-clip rounded-xl border border-gray-200 p-3 sm:p-4 dark:border-gray-700">
            <p className={`text-sm font-medium ${labelCl}`}>Tipo de evento</p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="eventType"
                  value="unique"
                  checked={form.eventType === 'unique'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#14b8a6] focus:ring-[#14b8a6]"
                />
                <span className={labelCl}>Único (fecha específica)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="eventType"
                  value="recurring"
                  checked={form.eventType === 'recurring'}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#14b8a6] focus:ring-[#14b8a6]"
                />
                <span className={labelCl}>Recurrente (semanal)</span>
              </label>
            </div>

            {form.eventType === 'unique' && (
              <div className="flex w-full min-w-0 max-w-full flex-col gap-4 pt-2">
                <div className="flex w-full min-w-0 max-w-full flex-row items-start gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="date" className={`mb-1 block text-sm ${mutedCl}`}>
                      Fecha inicio
                    </label>
                    <div className="qh-event-datetime-shell">
                      <input
                        id="date"
                        name="date"
                        type="date"
                        value={form.date}
                        min={todayYmdMin}
                        onChange={handleChange}
                        className="qh-event-datetime box-border w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white py-3 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#14b8a6] dark:border-gray-600 dark:bg-gray-800 dark:text-[#E0E0E0] sm:px-4"
                      />
                    </div>
                  </div>
                  <div className="w-[42%] max-w-[11rem] shrink-0 min-w-0 sm:w-[38%]">
                    <label htmlFor="time" className={`mb-1 block text-sm ${mutedCl}`}>
                      Hora inicio
                    </label>
                    <div className="qh-event-datetime-shell">
                      <input
                        id="time"
                        name="time"
                        type="time"
                        value={form.time}
                        onChange={handleChange}
                        className="qh-event-datetime box-border w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white py-3 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#14b8a6] dark:border-gray-600 dark:bg-gray-800 dark:text-[#E0E0E0] sm:px-4"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full min-w-0 max-w-full flex-row items-start gap-2 sm:gap-3">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="endDate" className={`mb-1 block text-sm ${mutedCl}`}>
                      Fecha fin
                    </label>
                    <div className="qh-event-datetime-shell">
                      <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={form.endDate}
                        min={
                          form.date && form.date >= todayYmdMin ? form.date : todayYmdMin
                        }
                        onChange={handleChange}
                        required={form.eventType === 'unique'}
                        className="qh-event-datetime box-border w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white py-3 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#14b8a6] dark:border-gray-600 dark:bg-gray-800 dark:text-[#E0E0E0] sm:px-4"
                      />
                    </div>
                  </div>
                  <div className="w-[42%] max-w-[11rem] shrink-0 min-w-0 sm:w-[38%]">
                    <label htmlFor="endTime" className={`mb-1 block text-sm ${mutedCl}`}>
                      Hora fin
                    </label>
                    <div className="qh-event-datetime-shell">
                      <input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={form.endTime}
                        onChange={handleChange}
                        className="qh-event-datetime box-border w-full min-w-0 max-w-full rounded-xl border border-gray-300 bg-white py-3 text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#14b8a6] dark:border-gray-600 dark:bg-gray-800 dark:text-[#E0E0E0] sm:px-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {form.eventType === 'recurring' && (
              <div className="pt-2">
                <label htmlFor="recurrence_day" className={`block text-sm ${mutedCl} mb-1`}>
                  Día de la semana (0=Dom, 6=Sáb)
                </label>
                <select
                  id="recurrence_day"
                  name="recurrence_day"
                  value={form.recurrence_day}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
                >
                  <option value="0">Domingo</option>
                  <option value="1">Lunes</option>
                  <option value="2">Martes</option>
                  <option value="3">Miércoles</option>
                  <option value="4">Jueves</option>
                  <option value="5">Viernes</option>
                  <option value="6">Sábado</option>
                </select>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 rounded-xl bg-[#14b8a6] hover:bg-[#0d9488] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-base shadow-lg shadow-[#14b8a6]/25 transition-colors focus:ring-2 focus:ring-[#14b8a6] focus:ring-offset-2 outline-none"
          >
            {submitting ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Publicar evento'}
          </button>
        </form>
      </main>

      {toastError ? (
        <div
          className={`fixed left-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg ${
            embeddedInMisEventos
              ? 'bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))]'
              : 'bottom-4'
          } ${
            isDark
              ? 'border-red-800 bg-[#2a1212] text-red-200'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
          role="alert"
          aria-live="assertive"
        >
          <p className="font-medium">No se pudo guardar</p>
          <p className="mt-1">{toastError}</p>
        </div>
      ) : null}
    </>
  )

  if (embeddedInMisEventos) {
    return formInner
  }

  return <div className={`min-h-screen ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>{formInner}</div>
}

export default AdminEventForm
