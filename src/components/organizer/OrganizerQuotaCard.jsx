/**
 * Muestra cuota mensual de eventos (usados / máximo del plan) con barra de progreso.
 * @param {{
 *   used: number
 *   limit: number
 *   planLabel: string
 *   loading?: boolean
 *   error?: string | null
 *   isDark: boolean
 * }} props
 */
export function OrganizerQuotaCard({ used, limit, planLabel, loading, error, isDark }) {
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 0
  const safeUsed = Number.isFinite(used) && used >= 0 ? Math.floor(used) : 0
  const remaining = safeLimit > 0 ? Math.max(0, safeLimit - safeUsed) : 0
  const pct = safeLimit > 0 ? Math.min(100, (safeUsed / safeLimit) * 100) : 0
  const atLimit = safeLimit > 0 && safeUsed >= safeLimit

  const now = new Date()
  const periodLabel = new Intl.DateTimeFormat('es-EC', { month: 'long', year: 'numeric' }).format(now)

  const cardCls = isDark
    ? 'border border-gray-800 bg-[#161616] shadow-sm shadow-black/20'
    : 'border border-gray-200 bg-white shadow-sm'

  if (error) {
    return (
      <div className={`rounded-2xl px-4 py-3 text-sm ${cardCls} text-red-600 dark:text-red-400`} role="alert">
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`rounded-2xl px-4 py-4 ${cardCls}`} aria-busy="true">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-300/50 dark:bg-gray-600/50" />
        <div className="mt-3 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700" />
      </div>
    )
  }

  return (
    <div className={`rounded-2xl px-4 py-4 ${cardCls}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            Cuota del mes
          </p>
          <p className={`mt-0.5 text-sm font-medium ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>
            Plan {planLabel}
            <span className={`font-normal ${isDark ? 'text-gray-500' : 'text-gray-500'}`}> · {periodLabel}</span>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end text-right">
          <span
            className={`text-3xl font-bold tabular-nums leading-none ${
              atLimit ? 'text-amber-500 dark:text-amber-400' : 'text-[#14b8a6]'
            }`}
            aria-live="polite"
          >
            {remaining}
          </span>
          <span className={`mt-1 text-xs font-medium ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
            {remaining === 1 ? 'restante' : 'restantes'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div
          className={`h-2.5 w-full overflow-hidden rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}
          role="progressbar"
          aria-valuenow={safeUsed}
          aria-valuemin={0}
          aria-valuemax={safeLimit}
          aria-label={`Eventos publicados este mes: ${safeUsed} de ${safeLimit}`}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              atLimit ? 'bg-amber-500' : 'bg-[#14b8a6]'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-2 text-xs">
          <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            <span className="font-semibold tabular-nums text-[#14b8a6]">{safeUsed}</span>
            {' de '}
            <span className="tabular-nums">{safeLimit}</span>
            {' usados'}
          </span>
          {atLimit ? (
            <span className="font-medium text-amber-600 dark:text-amber-400">Límite alcanzado</span>
          ) : (
            <span className={isDark ? 'text-gray-500' : 'text-gray-500'}>
              Puedes crear <span className="font-semibold tabular-nums">{remaining}</span> más
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
