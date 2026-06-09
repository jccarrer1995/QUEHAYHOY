/**
 * Contenedor compacto tipo tarjeta para listas de preferencias (sectores / categorías).
 *
 * @param {{
 *   isDark: boolean
 *   title: string
 *   subtitle: string
 *   heroTitleRef?: import('react').RefObject<HTMLHeadingElement | null>
 *   onSave: () => void
 *   saveLabel?: string
 *   children: import('react').ReactNode
 * }} props
 */
export function PreferenceSettingsPanel({
  isDark,
  title,
  subtitle,
  heroTitleRef,
  onSave,
  saveLabel = 'Guardar Preferencias',
  children,
}) {
  const subtitleCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const cardCls = isDark
    ? 'overflow-hidden rounded-2xl border border-gray-800 bg-[#1a1a1a] shadow-sm'
    : 'overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'
  const divideCls = isDark ? 'divide-y divide-gray-800' : 'divide-y divide-gray-100'
  const saveBtnCls = isDark
    ? 'mt-6 w-full rounded-xl bg-[#14b8a6] py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-[#0d9488]'
    : 'mt-6 w-full rounded-xl bg-slate-900 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-slate-800'

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-6">
      <section className="pb-5">
        <h2
          ref={heroTitleRef}
          className="m-0 text-2xl font-bold tracking-tight"
          style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}
        >
          {title}
        </h2>
        <p className={`mt-2 text-sm leading-5 ${subtitleCls}`}>{subtitle}</p>
      </section>

      <div className={cardCls}>
        <ul className={divideCls}>{children}</ul>
      </div>

      <button type="button" onClick={onSave} className={saveBtnCls}>
        {saveLabel}
      </button>
    </div>
  )
}

export default PreferenceSettingsPanel
