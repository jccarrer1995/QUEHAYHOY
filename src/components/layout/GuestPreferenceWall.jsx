/**
 * Pantalla completa para invitados en rutas de preferencias (sectores / categorías).
 */
import { ArrowLeft, Settings2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useProfileGoogleSignIn } from './useProfileGoogleSignIn.js'

function GoogleLogo({ className = 'h-7 w-7 shrink-0' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

/**
 * @param {{
 *   isDark: boolean
 *   title: string
 *   subtitle: string
 *   backTo?: string
 * }} props
 */
export function GuestPreferenceWall({ isDark, title, subtitle, backTo = '/perfil' }) {
  const navigate = useNavigate()
  const { signInWithGoogle, beginGoogleRedirect } = useAuth()
  const { handleGoogleClick, googleBusy } = useProfileGoogleSignIn({ signInWithGoogle, beginGoogleRedirect })

  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'
  const panelCls = isDark ? 'border-gray-800 bg-[#161616]' : 'border-gray-200 bg-gray-50'

  const googleBtnCls =
    'w-full max-w-sm flex items-center justify-center gap-3 rounded-2xl bg-[#14b8a6] py-4 pl-5 pr-6 text-base font-semibold text-white shadow-lg shadow-[#14b8a6]/25 transition hover:bg-[#0d9488] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60'

  return (
    <div className={`min-h-[100dvh] ${pageCls}`}>
      <header
        className={`fixed inset-x-0 top-0 z-40 px-4 pb-2 pt-[max(0.25rem,env(safe-area-inset-top))] ${
          isDark ? 'bg-[#121212]/95' : 'bg-white/95'
        }`}
      >
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className={`flex h-10 w-11 items-center justify-center rounded-full transition active:scale-95 ${
              isDark ? 'hover:bg-white/10 !text-gray-200' : 'hover:bg-black/5 !text-gray-900'
            }`}
            aria-label="Volver"
          >
            <ArrowLeft className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>
      </header>

      <main
        className={`mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center px-6 pb-24 pt-[calc(env(safe-area-inset-top)+4rem)] text-center`}
      >
        <div className={`w-full max-w-md rounded-2xl border px-6 py-10 ${panelCls}`}>
          <div
            className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${
              isDark ? 'bg-[#14b8a6]/15 text-[#5eead4]' : 'bg-teal-100 text-teal-700'
            }`}
            aria-hidden
          >
            <Settings2 className="h-8 w-8" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-bold leading-tight" style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
            {title}
          </h1>
          <p className={`mx-auto mt-3 max-w-sm text-sm leading-relaxed ${mutedCls}`}>{subtitle}</p>
          <button type="button" onClick={handleGoogleClick} disabled={googleBusy} className={`mt-8 ${googleBtnCls}`}>
            <GoogleLogo className="h-7 w-7 shrink-0" />
            {googleBusy ? 'Conectando…' : 'Iniciar sesión con Google'}
          </button>
        </div>
      </main>
    </div>
  )
}
