/**
 * Switch de visibilidad para preferencias (sectores / categorías).
 *
 * @param {{
 *   enabled: boolean
 *   onToggle: () => void
 *   label: string
 *   isDark?: boolean
 * }} props
 */
export function PreferenceVisibilitySwitch({ enabled, onToggle, label, isDark = false }) {
  const trackOff = isDark ? 'bg-gray-600' : 'bg-gray-300'
  const trackOn = 'bg-teal-500'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={`relative h-8 w-[51px] shrink-0 cursor-pointer rounded-full p-[3px] transition-colors ${
        enabled ? trackOn : trackOff
      }`}
    >
      <span
        className={`pointer-events-none absolute left-[3px] top-[3px] block h-[26px] w-[26px] rounded-full bg-white shadow-md ring-1 ring-black/5 transition-transform duration-200 ease-out will-change-transform dark:ring-white/10 ${
          enabled ? 'translate-x-[19px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export default PreferenceVisibilitySwitch
