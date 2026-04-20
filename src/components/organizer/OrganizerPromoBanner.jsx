import { Link } from 'react-router-dom'
import { Sparkles, ChevronRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.jsx'

/**
 * Banner de conversión a organizador.
 * Solo para usuarios con sesión iniciada y rol «Asistente» (no invitados ni ya organizadores).
 */
export function OrganizerPromoBanner({ isDark }) {
  const { user, profile, loading } = useAuth()

  if (loading) return null
  if (!user) return null

  const roleNorm = (profile?.role ?? '').trim().toLowerCase()
  if (roleNorm !== 'asistente') return null

  const cardBg = isDark
    ? 'from-zinc-900 via-zinc-900 to-teal-950/40 border-zinc-800'
    : 'from-amber-50 via-white to-teal-50/80 border-zinc-200/80'
  const textMain = isDark ? 'text-white' : 'text-zinc-900'
  const textSub = isDark ? 'text-zinc-400' : 'text-zinc-600'
  const ctaCls = isDark
    ? 'bg-zinc-100 text-zinc-900 hover:bg-white'
    : 'bg-zinc-900 text-white hover:bg-zinc-800'

  return (
    <section className="mt-5 mb-6" aria-label="Promoción organizadores">
      <Link
        to="/onboarding-organizador"
        className={`group relative flex w-full overflow-hidden rounded-3xl border bg-gradient-to-br shadow-lg shadow-black/10 transition hover:shadow-xl dark:shadow-black/40 ${cardBg}`}
      >
        <div className="flex min-h-[120px] flex-1 flex-col justify-center gap-2 px-5 py-4 sm:min-h-[128px] sm:max-w-[62%]">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-500">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Para locales y productores
          </span>
          <p className={`text-lg font-bold leading-snug sm:text-xl ${textMain}`}>
            Probar subir eventos{' '}
            <span className="text-amber-500 dark:text-amber-400">sin costo</span>
          </p>
          <p className={`text-sm ${textSub}`}>
            Publica en QUEHAYHOY y llega a más gente en Guayaquil.
          </p>
          <span
            className={`mt-1 inline-flex w-fit items-center gap-1 rounded-full px-4 py-2 text-sm font-bold transition ${ctaCls}`}
          >
            Empezar
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
        <div
          className={`relative hidden min-w-[38%] items-center justify-center sm:flex ${isDark ? 'bg-zinc-800/50' : 'bg-amber-100/60'}`}
          aria-hidden
        >
          <span className="text-5xl drop-shadow-md">🎟️</span>
          <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/5 dark:to-black/20" />
        </div>
      </Link>
    </section>
  )
}
