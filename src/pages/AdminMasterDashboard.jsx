import { useMemo } from 'react'
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  DollarSign,
  Users,
} from 'lucide-react'
import { BottomNav, Footer, Navbar } from '../components/layout'
import { useTheme } from '../contexts/ThemeContext.jsx'

/** @typedef {{ label: string, users: number, organizers: number }} GrowthPoint */

/** @type {GrowthPoint[]} */
const GROWTH_SERIES = [
  { label: 'Ene', users: 420, organizers: 28 },
  { label: 'Feb', users: 468, organizers: 31 },
  { label: 'Mar', users: 512, organizers: 36 },
  { label: 'Abr', users: 558, organizers: 41 },
  { label: 'May', users: 601, organizers: 45 },
  { label: 'Jun', users: 648, organizers: 52 },
]

/**
 * @param {{
 *   title: string
 *   subtitle: string
 *   series: GrowthPoint[]
 *   valueKey: 'users' | 'organizers'
 *   barColor: string
 *   maxValue: number
 *   isDark: boolean
 * }} props
 */
function GrowthBarChart({ title, subtitle, series, valueKey, barColor, maxValue, isDark }) {
  const chartShellCls = isDark
    ? 'rounded-xl border border-gray-800 bg-[#1a1a1a]'
    : 'rounded-xl border border-gray-200 bg-[#f8fafc]'
  const titleCls = isDark ? '!text-[#E0E0E0]' : '!text-[#0a0a0a]'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const axisCls = isDark ? 'border-gray-700' : 'border-gray-300'

  return (
    <div className={`${chartShellCls} p-4 sm:p-5`}>
      <h3 className={`text-sm font-bold sm:text-base ${titleCls}`} style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
        {title}
      </h3>
      <p className={`mt-0.5 text-xs ${mutedCls}`}>{subtitle}</p>

      <div className={`mt-5 flex items-end justify-between gap-1.5 border-b pb-2 sm:gap-2 ${axisCls}`}>
        {series.map((point) => {
          const value = point[valueKey]
          const heightPct = maxValue > 0 ? Math.max(Math.round((value / maxValue) * 100), value > 0 ? 10 : 0) : 0

          return (
            <div key={`${title}-${point.label}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span className={`text-[10px] font-semibold tabular-nums sm:text-xs ${mutedCls}`}>{value}</span>
              <div className="flex h-32 w-full items-end justify-center">
                <div
                  className={`w-full max-w-9 rounded-t-lg ${barColor}`}
                  style={{ height: `${heightPct}%`, minHeight: value > 0 ? '0.5rem' : 0 }}
                  title={`${point.label}: ${value}`}
                />
              </div>
              <span className={`text-[10px] font-semibold sm:text-xs ${mutedCls}`}>{point.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Panel de control maestro para Administrador Global (inicio `/`).
 */
export function AdminMasterDashboard() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const maxUsers = useMemo(() => Math.max(...GROWTH_SERIES.map((p) => p.users), 1), [])
  const maxOrganizers = useMemo(() => Math.max(...GROWTH_SERIES.map((p) => p.organizers), 1), [])

  const shellCls = isDark
    ? 'min-h-screen bg-[#121212] text-[#E0E0E0]'
    : 'min-h-screen bg-[#f8fafc] text-gray-900'
  const cardCls = isDark
    ? 'rounded-2xl border border-gray-800 bg-[#161616] shadow-sm'
    : 'rounded-2xl border border-gray-100 bg-white shadow-sm'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const titleCls = isDark ? '!text-[#E0E0E0]' : '!text-[#0a0a0a]'
  const titleStyle = isDark ? { color: '#E0E0E0' } : { color: '#0a0a0a' }

  const metrics = [
    {
      id: 'users',
      label: 'Usuarios Activos',
      value: '2.847',
      badge: '+12,4% este mes',
      icon: Users,
      iconCls: isDark ? 'text-[#5eead4]' : 'text-[#0d9488]',
      iconBgCls: isDark ? 'bg-[#14b8a6]/15' : 'bg-[#14b8a6]/10',
    },
    {
      id: 'organizers',
      label: 'Organizadores Totales',
      value: '186',
      badge: '+8 nuevos',
      icon: Building2,
      iconCls: isDark ? 'text-indigo-300' : 'text-indigo-600',
      iconBgCls: isDark ? 'bg-indigo-400/15' : 'bg-indigo-50',
    },
    {
      id: 'events',
      label: 'Eventos en Cartelera',
      value: '412',
      badge: 'Mes actual',
      icon: CalendarDays,
      iconCls: isDark ? 'text-amber-300' : 'text-amber-600',
      iconBgCls: isDark ? 'bg-amber-400/15' : 'bg-amber-50',
    },
    {
      id: 'revenue',
      label: 'Ingresos de la Plataforma',
      value: '$18.420',
      badge: 'Comisiones + planes',
      icon: DollarSign,
      iconCls: isDark ? 'text-emerald-300' : 'text-emerald-600',
      iconBgCls: isDark ? 'bg-emerald-400/15' : 'bg-emerald-50',
    },
  ]

  return (
    <div className={`flex flex-col pb-20 transition-colors md:pb-0 ${shellCls}`}>
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 md:py-6">
        <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon
            return (
              <article key={metric.id} className={`${cardCls} p-4 sm:p-5`}>
                <div className="flex items-start justify-between gap-2">
                  <div className={`inline-flex rounded-xl p-2 sm:p-2.5 ${metric.iconBgCls}`}>
                    <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${metric.iconCls}`} strokeWidth={2} aria-hidden />
                  </div>
                  {metric.id === 'users' ? (
                    <span className="inline-flex max-w-[48%] items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold leading-tight text-emerald-700 sm:max-w-none sm:px-2 sm:text-[11px] dark:bg-emerald-950/50 dark:text-emerald-300">
                      <ArrowUpRight className="h-3 w-3 shrink-0" strokeWidth={2.5} />
                      <span className="truncate">{metric.badge}</span>
                    </span>
                  ) : (
                    <span
                      className={`max-w-[48%] truncate text-right text-[10px] font-medium sm:max-w-none sm:text-[11px] ${mutedCls}`}
                    >
                      {metric.badge}
                    </span>
                  )}
                </div>
                <p className={`mt-3 text-xs font-semibold sm:mt-4 sm:text-sm ${titleCls}`} style={titleStyle}>
                  {metric.label}
                </p>
                <p className={`mt-1 text-xl font-bold tracking-tight sm:text-2xl ${titleCls}`} style={titleStyle}>
                  {metric.value}
                </p>
              </article>
            )
          })}
        </section>

        <section>
          <article className={`${cardCls} p-6`}>
            <div className="mb-5">
              <h2 className={`text-lg font-bold ${titleCls}`} style={titleStyle}>
                Crecimiento de la plataforma
              </h2>
              <p className={`mt-1 text-sm ${mutedCls}`}>Últimos 6 meses — usuarios y organizadores por separado</p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <GrowthBarChart
                title="Usuarios"
                subtitle="Nuevos registros activos por mes"
                series={GROWTH_SERIES}
                valueKey="users"
                barColor="bg-[#14b8a6]"
                maxValue={maxUsers}
                isDark={isDark}
              />
              <GrowthBarChart
                title="Organizadores"
                subtitle="Creadores verificados por mes"
                series={GROWTH_SERIES}
                valueKey="organizers"
                barColor="bg-indigo-500"
                maxValue={maxOrganizers}
                isDark={isDark}
              />
            </div>
          </article>
        </section>
      </main>

      <Footer />
      <BottomNav activeTab="home" onTabChange={() => {}} />
    </div>
  )
}

export default AdminMasterDashboard
