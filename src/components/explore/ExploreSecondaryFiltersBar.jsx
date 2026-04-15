/**
 * Segunda fila de filtros en Explorar: Gratis (toggle) + carrusel de tiempo.
 */
import { EXPLORE_TIME_CHIPS } from '../../lib/exploreTimeFilters.js'

/**
 * @param {{
 *   isFreeActive: boolean
 *   onFreeToggle: () => void
 *   timePreset: 'today' | 'tomorrow' | 'weekend' | 'month' | null
 *   onTimePresetChange: (preset: 'today' | 'tomorrow' | 'weekend' | 'month' | null) => void
 *   isDark: boolean
 * }} props
 */
export function ExploreSecondaryFiltersBar({
  isFreeActive,
  onFreeToggle,
  timePreset,
  onTimePresetChange,
  isDark,
}) {
  const shell =
    'rounded-2xl border shadow-sm backdrop-blur-[8px] ' +
    (isDark ? 'border-white/10 bg-[#121212]/55' : 'border-black/10 bg-white/55')

  const freeInactive = isDark
    ? 'border border-white/15 bg-white/5 text-[#E0E0E0] hover:bg-white/10'
    : 'border border-gray-400/90 bg-white !text-[#0a0a0a] shadow-sm hover:bg-gray-50'
  const freeActive = isDark
    ? 'border border-[#2dd4bf] bg-[#0d9488] text-white shadow-sm'
    : 'border border-[#14b8a6] bg-[#14b8a6] !text-white shadow-sm shadow-[#14b8a6]/25'

  const chipBase =
    'shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition active:scale-[0.98]'
  const chipOff = isDark
    ? 'border-white/15 bg-transparent text-gray-300 hover:border-white/25 hover:bg-white/5'
    : 'border-gray-200/80 bg-white/50 text-gray-700 hover:border-gray-300 hover:bg-white/70'
  const chipOn = isDark
    ? 'border-[#14b8a6]/80 bg-[#14b8a6]/20 text-[#5eead4]'
    : 'border-[#14b8a6] bg-[#14b8a6]/15 text-[#0f766e]'

  return (
    <div
      className={`pointer-events-auto flex min-h-[40px] items-stretch gap-0 px-2 py-1.5 ${shell}`}
      role="toolbar"
      aria-label="Filtros de precio y fecha"
    >
      <button
        type="button"
        onClick={onFreeToggle}
        aria-pressed={isFreeActive}
        className={`flex shrink-0 items-center gap-1.5 self-center rounded-xl px-3 py-1.5 text-xs font-semibold transition ${isFreeActive ? freeActive : freeInactive}`}
      >
        <span aria-hidden className={isDark ? '' : 'opacity-95'}>
          🏷️
        </span>
        <span className={isFreeActive || isDark ? '' : '!text-[#0a0a0a]'}>Gratis</span>
      </button>

      <div
        className={`mx-1.5 w-px shrink-0 self-stretch ${isDark ? 'bg-white/12' : 'bg-black/8'}`}
        aria-hidden
      />

      <div
        className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="radiogroup"
        aria-label="Filtrar por fecha"
      >
        {EXPLORE_TIME_CHIPS.map((chip) => {
          const active = timePreset === chip.id
          return (
            <button
              key={chip.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onTimePresetChange(chip.id)}
              className={`${chipBase} ${active ? chipOn : chipOff}`}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default ExploreSecondaryFiltersBar
