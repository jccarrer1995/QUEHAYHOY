import { deleteField, serverTimestamp, Timestamp } from 'firebase/firestore'
import {
  BADGE_FORM_OPTIONS,
  badgeTypeToFormValue,
  legacyBadgeLabelToFormValue,
} from '../../lib/eventBadges.js'

/** Aforo fijo en Firestore (el formulario ya no lo edita). */
export const DEFAULT_EVENT_CAPACITY = 100

/** Descripción: máximo de caracteres en admin. */
export const DESCRIPTION_MAX_LENGTH = 750

/** Opciones del select «Etiqueta» (admin) */
export const BADGE_LABELS = BADGE_FORM_OPTIONS

export const SECTOR_TO_FIRESTORE = {
  urdesa: 'Urdesa',
  'las-penas': 'Las Peñas',
  guayarte: 'Guayarte',
  samanes: 'Samanes',
  kennedy: 'Kennedy',
  bellavista: 'Bellavista',
  'malecon-salado': 'Malecón del Salado',
  centro: 'Centro',
  alborada: 'Alborada',
  'la-joya': 'La Joya',
}

export const initialForm = {
  title: '',
  description: '',
  sector: 'urdesa',
  category: 'bares',
  price: '',
  capacity: '',
  capacity_level: '',
  badgeType: '',
  imageUrl: '',
  address: '',
  latitude: '',
  longitude: '',
  eventType: 'unique',
  date: '',
  time: '',
  endDate: '',
  endTime: '',
  recurrence_day: '0',
  popularidad: '1',
}

function getLastDayOfMonth(date) {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * @param {string} firestoreSector
 * @returns {string}
 */
export function firestoreSectorToFormId(firestoreSector) {
  if (!firestoreSector) return 'urdesa'
  const found = Object.entries(SECTOR_TO_FIRESTORE).find(([, v]) => v === firestoreSector)
  return found ? found[0] : 'urdesa'
}

/**
 * @param {string} cat
 * @returns {string}
 */
export function firestoreCategoryToFormId(cat) {
  if (!cat || cat === 'All' || cat === 'all') return 'bares'
  return cat.charAt(0).toLowerCase() + cat.slice(1)
}

/**
 * @param {import('firebase/firestore').Timestamp | undefined} ts
 * @returns {string}
 */
export function timestampToDateInput(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * @param {import('firebase/firestore').Timestamp | undefined} ts
 * @returns {string}
 */
export function timestampToTimeInput(ts) {
  if (!ts?.toDate) return ''
  const d = ts.toDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${h}:${min}`
}

/**
 * @param {Record<string, unknown>} data
 * @returns {typeof initialForm}
 */
/**
 * @param {unknown} v
 * @returns {string}
 */
function coordToFormString(v) {
  if (v == null || v === '') return ''
  if (typeof v === 'number' && Number.isFinite(v)) return String(v)
  const n = Number(v)
  return Number.isFinite(n) ? String(n) : ''
}

export function mapFirestoreDocToForm(data) {
  const type =
    data.type === 'unique' || data.type === 'recurring'
      ? data.type
      : data.eventType === 'recurring'
        ? 'recurring'
        : 'unique'

  const sector = firestoreSectorToFormId(
    typeof data.sector === 'string' ? data.sector : String(data.location ?? '')
  )

  const base = {
    title: typeof data.title === 'string' ? data.title : '',
    description: typeof data.description === 'string' ? data.description : '',
    sector,
    category: firestoreCategoryToFormId(typeof data.category === 'string' ? data.category : ''),
    price: data.price != null && data.price !== '' ? String(data.price) : '',
    capacity: data.capacity != null && data.capacity !== '' ? String(data.capacity) : '',
    capacity_level: typeof data.capacity_level === 'string' ? data.capacity_level : '',
    badgeType: (() => {
      const fromNew = badgeTypeToFormValue(data.badgeType)
      if (fromNew) return fromNew
      return legacyBadgeLabelToFormValue(data.badgeLabel || data.capacity_level || '')
    })(),
    imageUrl: typeof data.image_url === 'string' ? data.image_url : '',
    address: typeof data.address === 'string' ? data.address : '',
    latitude: coordToFormString(data.latitude ?? data.lat),
    longitude: coordToFormString(data.longitude ?? data.lng),
    eventType: type === 'recurring' ? 'recurring' : 'unique',
    date: '',
    time: '',
    endDate: '',
    endTime: '',
    recurrence_day: '0',
    popularidad: data.popularidad != null ? String(data.popularidad) : '1',
  }

  if (type === 'recurring') {
    const rd = data.recurrence_day
    const n = typeof rd === 'number' ? rd : Number(rd)
    base.recurrence_day = Number.isNaN(n) ? '0' : String(n)
    base.date = ''
    base.time = ''
  } else {
    const dateTs = data.date
    const endTs = data.endDate ?? data.date
    base.date = timestampToDateInput(dateTs)
    base.time = timestampToTimeInput(dateTs)
    base.endDate = timestampToDateInput(endTs)
    base.endTime = timestampToTimeInput(endTs)
  }

  return base
}

/**
 * @param {string | undefined} s
 * @returns {number | null}
 */
function parseOptionalCoord(s) {
  if (s == null || String(s).trim() === '') return null
  const n = Number(String(s).trim().replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * @param {typeof initialForm} form
 * @param {{ isUpdate: boolean, slug?: string, organizerUid?: string | null }} opts
 * @returns {Record<string, unknown>}
 */
export function buildEventPayload(form, opts) {
  const { isUpdate, slug, organizerUid } = opts
  const payload = {
    title: form.title.trim(),
    description: (form.description || '').trim(),
    sector: form.sector ? SECTOR_TO_FIRESTORE[form.sector] ?? form.sector : '',
    location: form.sector ? SECTOR_TO_FIRESTORE[form.sector] ?? form.sector : '',
    category:
      form.category && form.category !== 'all'
        ? form.category.charAt(0).toUpperCase() + form.category.slice(1)
        : 'All',
    price: form.price !== '' ? (Number.isNaN(Number(form.price)) ? 0 : Number(form.price)) : null,
    capacity: DEFAULT_EVENT_CAPACITY,
    capacity_level: form.capacity_level || null,
    badgeType: form.badgeType && form.badgeType !== '' ? form.badgeType : null,
    image_url: (form.imageUrl || '').trim() || null,
    address: (form.address || '').trim() || null,
    popularidad: form.popularidad && form.popularidad !== '' ? Math.min(Math.max(Number(form.popularidad) || 1, 1), 3) : 1,
  }

  const lat = parseOptionalCoord(form.latitude)
  const lng = parseOptionalCoord(form.longitude)
  if (lat != null && lng != null) {
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      payload.latitude = lat
      payload.longitude = lng
    } else {
      payload.latitude = null
      payload.longitude = null
    }
  } else {
    payload.latitude = null
    payload.longitude = null
  }

  if (typeof slug === 'string' && slug.trim() !== '') {
    payload.slug = slug.trim()
  }

  if (!isUpdate) {
    payload.createdAt = serverTimestamp()
    payload.isVisible = true
    if (typeof organizerUid === 'string' && organizerUid.trim() !== '') {
      payload.createdByUid = organizerUid.trim()
    }
  } else {
    payload.updatedAt = serverTimestamp()
    payload.badgeLabel = deleteField()
  }

  if (form.eventType === 'unique') {
    payload.type = 'unique'
    if (isUpdate) {
      payload.recurrence_day = deleteField()
      payload.eventType = deleteField()
      payload.active_until = deleteField()
    }
    if (form.date && form.time) {
      const [year, month, day] = form.date.split('-').map(Number)
      const [hour, min] = form.time.split(':').map(Number)
      const dateObj = new Date(year, month - 1, day, hour, min, 0, 0)
      const ts = Timestamp.fromDate(dateObj)
      payload.date = ts
      if (form.endDate && form.endTime) {
        const [endYear, endMonth, endDay] = form.endDate.split('-').map(Number)
        const [endHour, endMin] = form.endTime.split(':').map(Number)
        const endObj = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 0, 0)
        payload.endDate = Timestamp.fromDate(endObj)
      } else if (form.endDate) {
        const [endYear, endMonth, endDay] = form.endDate.split('-').map(Number)
        const endObj = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
        payload.endDate = Timestamp.fromDate(endObj)
      } else {
        payload.endDate = ts
      }
    } else if (form.date) {
      const [year, month, day] = form.date.split('-').map(Number)
      const start = new Date(year, month - 1, day, 0, 0, 0, 0)
      payload.date = Timestamp.fromDate(start)
      if (form.endDate && form.endTime) {
        const [endYear, endMonth, endDay] = form.endDate.split('-').map(Number)
        const [endHour, endMin] = form.endTime.split(':').map(Number)
        const endObj = new Date(endYear, endMonth - 1, endDay, endHour, endMin, 0, 0)
        payload.endDate = Timestamp.fromDate(endObj)
      } else if (form.endDate) {
        const [endYear, endMonth, endDay] = form.endDate.split('-').map(Number)
        const endObj = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999)
        payload.endDate = Timestamp.fromDate(endObj)
      } else {
        const end = new Date(year, month - 1, day, 23, 59, 59, 999)
        payload.endDate = Timestamp.fromDate(end)
      }
    } else {
      payload.date = ''
      if (isUpdate) {
        payload.endDate = deleteField()
      }
    }
  } else {
    payload.type = 'recurring'
    payload.eventType = 'recurring'
    payload.recurrence_day = parseInt(form.recurrence_day, 10)
    const lastDay = getLastDayOfMonth(new Date())
    payload.active_until = Timestamp.fromDate(lastDay)
    if (isUpdate) {
      payload.date = deleteField()
      payload.endDate = deleteField()
    } else {
      payload.date = ''
    }
  }

  return payload
}
