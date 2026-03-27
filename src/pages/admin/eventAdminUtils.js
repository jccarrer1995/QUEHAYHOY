import { deleteField, serverTimestamp, Timestamp } from 'firebase/firestore'
import {
  BADGE_FORM_OPTIONS,
  badgeTypeToFormValue,
  legacyBadgeLabelToFormValue,
} from '../../lib/eventBadges.js'

/** Opciones del select «Badge conceptual» (alias para el admin) */
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
 * @param {typeof initialForm} form
 * @param {{ isUpdate: boolean }} opts
 * @returns {Record<string, unknown>}
 */
export function buildEventPayload(form, opts) {
  const { isUpdate } = opts
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
    capacity: form.capacity !== '' ? (Number.isNaN(Number(form.capacity)) ? null : Number(form.capacity)) : null,
    capacity_level: form.capacity_level || null,
    badgeType: form.badgeType && form.badgeType !== '' ? form.badgeType : null,
    image_url: (form.imageUrl || '').trim() || null,
    address: (form.address || '').trim() || null,
    popularidad: form.popularidad && form.popularidad !== '' ? Math.min(Math.max(Number(form.popularidad) || 1, 1), 3) : 1,
  }

  if (!isUpdate) {
    payload.createdAt = serverTimestamp()
    payload.isVisible = true
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
