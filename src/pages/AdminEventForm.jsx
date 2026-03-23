/**
 * AdminEventForm - Formulario para publicar eventos en Firestore
 * Ruta: /wp-admin
 * Soporta eventos únicos (fecha Timestamp) y recurrentes (recurrence_day + active_until)
 */
import { useState } from 'react'
import { collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebaseConfig'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { CATEGORIES } from '../components/events/CategorySelector'
import { SECTORS } from '../components/events/SectorSelector'

const SECTOR_TO_FIRESTORE = {
  urdesa: 'Urdesa',
  'las-penas': 'Las Peñas',
  guayarte: 'Guayarte',
  samanes: 'Samanes',
}

const CAPACITY_LEVELS = [
  { value: 'INTIMATE', label: 'Exclusivo (<30)' },
  { value: 'EXCLUSIVE', label: 'Exclusivo' },
  { value: 'SOCIAL', label: 'Social (30-150)' },
  { value: 'LARGE', label: 'Social (150-400)' },
  { value: 'MASSIVE', label: 'Masivo (>400)' },
]

function getLastDayOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

const initialForm = {
  title: '',
  description: '',
  sector: 'urdesa',
  category: 'bares',
  price: '',
  capacity: '',
  capacity_level: '',
  imageUrl: '',
  address: '',
  eventType: 'unique',
  date: '',
  time: '',
  recurrence_day: '0',
}

export function AdminEventForm() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const labelCl = isDark ? 'text-gray-200' : 'text-gray-800'
  const mutedCl = isDark ? 'text-gray-400' : 'text-gray-600'
  const [form, setForm] = useState(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    if (!form.title?.trim()) {
      setError('El título es obligatorio.')
      setSubmitting(false)
      return
    }

    if (!db) {
      setError('Firebase no está configurado.')
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        title: form.title.trim(),
        description: (form.description || '').trim(),
        sector: form.sector ? (SECTOR_TO_FIRESTORE[form.sector] ?? form.sector) : '',
        location: form.sector ? (SECTOR_TO_FIRESTORE[form.sector] ?? form.sector) : '',
        category:
          form.category && form.category !== 'all'
            ? form.category.charAt(0).toUpperCase() + form.category.slice(1)
            : 'All',
        price: form.price !== '' ? (isNaN(Number(form.price)) ? 0 : Number(form.price)) : null,
        capacity: form.capacity !== '' ? (isNaN(Number(form.capacity)) ? null : Number(form.capacity)) : null,
        capacity_level: form.capacity_level || null,
        image_url: (form.imageUrl || '').trim() || null,
        address: (form.address || '').trim() || null,
        createdAt: serverTimestamp(),
      }

      if (form.eventType === 'unique') {
        if (form.date && form.time) {
          const [year, month, day] = form.date.split('-').map(Number)
          const [hour, min] = form.time.split(':').map(Number)
          const dateObj = new Date(year, month - 1, day, hour, min, 0, 0)
          payload.date = Timestamp.fromDate(dateObj)
        } else if (form.date) {
          const [year, month, day] = form.date.split('-').map(Number)
          payload.date = Timestamp.fromDate(new Date(year, month - 1, day, 0, 0, 0, 0))
        } else {
          payload.date = ''
        }
      } else {
        payload.eventType = 'recurring'
        payload.recurrence_day = parseInt(form.recurrence_day, 10)
        const lastDay = getLastDayOfMonth(new Date())
        payload.active_until = Timestamp.fromDate(lastDay)
        payload.date = '' // Para que use recurrence_day en la lógica de la app
      }

      await addDoc(collection(db, 'events'), payload)
      setForm(initialForm)
      alert('Evento publicado correctamente.')
    } catch (err) {
      setError(err.message ?? 'Error al guardar el evento.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>
      <header className={`sticky top-0 z-10 border-b backdrop-blur ${
        isDark ? 'border-gray-800 bg-[#121212]/95' : 'border-gray-200 bg-white/95'
      }`}>
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              to="/"
              className={`p-2 -ml-2 rounded-lg hover:opacity-80 transition-colors flex-shrink-0 ${isDark ? 'text-gray-300 hover:text-[#E0E0E0]' : 'text-gray-700 hover:text-gray-900'}`}
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1
              className="text-lg font-bold truncate"
              style={{ color: isDark ? '#ffffff' : '#0a0a0a' }}
            >
              Publicar evento
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

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none transition"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Descripción
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descripción del evento..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none transition resize-none"
            />
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <label htmlFor="capacity" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
                Aforo
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                value={form.capacity}
                onChange={handleChange}
                placeholder="Ej: 150"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label htmlFor="capacity_level" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              Nivel de aforo
            </label>
            <select
              id="capacity_level"
              name="capacity_level"
              value={form.capacity_level}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            >
              <option value="">Sin especificar</option>
              {CAPACITY_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="imageUrl" className={`block text-sm font-medium ${labelCl} mb-1.5`}>
              URL de imagen
            </label>
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={form.imageUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] placeholder-gray-400 focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
            />
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
          </div>

          {/* Tipo de evento: único o recurrente */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-4">
            <p className={`text-sm font-medium ${labelCl}`}>Tipo de evento</p>
            <div className="flex gap-4">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label htmlFor="date" className={`block text-sm ${mutedCl} mb-1`}>
                    Fecha
                  </label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="time" className={`block text-sm ${mutedCl} mb-1`}>
                    Hora
                  </label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={form.time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-[#E0E0E0] focus:ring-2 focus:ring-[#14b8a6] focus:border-transparent outline-none"
                  />
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
            {submitting ? 'Publicando...' : 'Publicar Evento'}
          </button>
        </form>
      </main>
    </div>
  )
}

export default AdminEventForm
