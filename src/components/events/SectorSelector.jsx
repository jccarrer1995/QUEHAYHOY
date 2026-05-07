import { MapPin, Sparkles } from 'lucide-react'
import { useSectorVisibility } from '../../contexts/SectorVisibilityContext.jsx'
import { SECTORS } from '../../lib/topSectors.js'

export { SECTORS }

/**
 * @param {{
 *   activeSector: string
 *   onSelect: (id: string) => void
 *   isDark?: boolean
 *   variant?: 'toolbar' | 'sheet'
 * }} props
 */
export function SectorSelector({ activeSector, onSelect, isDark = false, variant = 'toolbar' }) {
  const { isSectorVisible } = useSectorVisibility()
  const visibleSectors = SECTORS.filter(
    (sector) => sector.id === 'all' || isSectorVisible(sector.id)
  )
  const btnBase =
    'px-3 py-2 rounded-full text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 flex-shrink-0 border cursor-pointer'
  const btnActive = 'bg-[#14b8a6] text-white border-[#14b8a6]'
  const btnInactive = isDark
    ? 'bg-transparent text-gray-300 border-gray-600 hover:border-gray-500 hover:text-[#E0E0E0]'
    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:text-gray-900'
  const headingCl = isDark ? '!text-[#E0E0E0]' : '!text-[#0a0a0a]'

  const scrollRowCls =
    variant === 'sheet'
      ? 'flex gap-2 overflow-x-auto pb-2 scrollbar-hide'
      : 'flex min-w-0 flex-1 gap-2 overflow-x-auto scrollbar-hide'

  const chipButtons = visibleSectors.map((sector) => {
    const isActive = activeSector === sector.id

    return (
      <button
        key={sector.id}
        type="button"
        onClick={() => onSelect(sector.id)}
        className={`${btnBase} ${isActive ? btnActive : btnInactive}`}
        aria-pressed={isActive}
      >
        {sector.id === 'all' ? (
          <Sparkles className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        ) : (
          <MapPin className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        )}
        <span>{sector.label}</span>
      </button>
    )
  })

  if (variant === 'sheet') {
    return (
      <div className="w-full">
        <div className={scrollRowCls}>{chipButtons}</div>
      </div>
    )
  }

  return (
    <div className="-mx-4 flex w-full items-center gap-3 px-4 pb-2 md:mx-0 md:px-0">
      <h3 className={`shrink-0 text-sm font-bold tracking-wider ${headingCl}`}>Sectores</h3>
      <div className={scrollRowCls}>{chipButtons}</div>
    </div>
  )
}

export default SectorSelector
