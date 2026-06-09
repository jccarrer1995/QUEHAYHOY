import { LayoutGrid, List } from 'lucide-react'
import { EVENT_SORT_OPTIONS } from '../../lib/eventSort.js'

/**
 * Barra de ordenación (izquierda) y vista grid/list (derecha) para catálogos de eventos.
 *
 * @param {{
 *   isDark: boolean
 *   sortBy: string
 *   onSortChange: (value: string) => void
 *   viewMode: 'grid' | 'list'
 *   onViewModeChange: (mode: 'grid' | 'list') => void
 * }} props
 */
export function EventCatalogToolbar({ isDark, sortBy, onSortChange, viewMode, onViewModeChange }) {
  const layoutWrapCls = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const selectCls = isDark
    ? 'border-gray-700 bg-[#161616] text-[#E0E0E0] focus:border-[#14b8a6] focus:ring-[#14b8a6]/30'
    : 'border-gray-200 bg-white text-gray-900 focus:border-[#14b8a6] focus:ring-[#14b8a6]/25'

  return (
    <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <label className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-md">
        <span className={`shrink-0 text-sm font-medium ${labelCls}`}>Ordenar por:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className={`min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm font-medium outline-none transition focus:ring-2 ${selectCls}`}
          aria-label="Ordenar eventos"
        >
          {EVENT_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className={`inline-flex shrink-0 items-center rounded-xl border p-1 ${layoutWrapCls}`}>
        <button
          type="button"
          onClick={() => onViewModeChange('grid')}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
            viewMode === 'grid'
              ? 'bg-[#14b8a6] text-white shadow-sm'
              : isDark
                ? 'text-gray-300 hover:bg-white/10'
                : 'text-gray-600 hover:bg-black/5'
          }`}
          aria-label="Ver en cuadrícula"
          aria-pressed={viewMode === 'grid'}
        >
          <LayoutGrid className="h-5 w-5" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('list')}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition ${
            viewMode === 'list'
              ? 'bg-[#14b8a6] text-white shadow-sm'
              : isDark
                ? 'text-gray-300 hover:bg-white/10'
                : 'text-gray-600 hover:bg-black/5'
          }`}
          aria-label="Ver en listado"
          aria-pressed={viewMode === 'list'}
        >
          <List className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </section>
  )
}

export default EventCatalogToolbar
