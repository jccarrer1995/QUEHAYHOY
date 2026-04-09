/**
 * Menú de cuenta exclusivo para desktop (drawer del botón hamburguesa).
 * Intencionalmente separado de `ProfileMenuContent` para desacoplar desktop de `/perfil`.
 */
import { Compass, Heart, MapPin, Tags, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { APP_VERSION } from '../../lib/appVersion.js'

/** Logo oficial de Google a color (marca G multicolor) */
function GoogleLogo({ className = 'h-6 w-6 shrink-0' }) {
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

function SettingsRow({ icon: RowIcon, label, onClick, isDark, withBorder = true }) {
  const borderCls = isDark ? 'border-gray-800' : 'border-gray-200'
  const activeCls = isDark ? 'active:bg-white/5' : 'active:bg-black/5'
  const hoverCls = isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-black/[0.03]'
  const labelCls = isDark ? '!text-[#E0E0E0]' : '!text-gray-900'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full cursor-pointer items-center py-4 text-left transition-colors duration-200 ease-out ${withBorder ? `border-b ${borderCls}` : ''} ${activeCls} ${hoverCls} ${labelCls}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center transition-transform duration-200 ease-out group-hover:scale-105 ${labelCls}`}
        style={{ width: 24 }}
      >
        <RowIcon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
      </span>
      <span
        className={`min-w-0 flex-1 text-base font-medium transition-colors duration-200 ${labelCls}`}
        style={{ marginLeft: 15 }}
      >
        {label}
      </span>
    </button>
  )
}

/**
 * @param {{ onClose?: () => void }} props
 */
export function DesktopProfileMenuContent({ onClose }) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { signInWithGoogle, user } = useAuth()

  const googleBtnCls = isDark
    ? 'bg-white text-black shadow-sm'
    : 'border border-gray-200 bg-white text-black shadow-sm'
  const greetingCls = isDark ? 'text-gray-300' : 'text-gray-600'
  const borderBar = isDark ? 'border-gray-800' : 'border-gray-200'
  const drawerBg = isDark ? 'bg-[#121212]' : 'bg-white'

  async function handleGoogle() {
    try {
      await signInWithGoogle()
    } catch {
      // AuthContext ya loguea
    }
  }

  function goSectores() {
    navigate('/perfil/sectores')
    onClose?.()
  }

  function goCategorias() {
    navigate('/perfil/categorias')
    onClose?.()
  }

  function goFavoritos() {
    navigate('/favoritos')
    onClose?.()
  }

  function showComingSoon(kind) {
    const messages = {
      explore: 'Estamos mapeando los mejores rincones de GYE para ti. ¡Muy pronto! 📍',
    }

    toast(messages[kind], {
      icon: '🧭',
      style: {
        background: isDark ? '#121212' : '#ffffff',
        border: `1px solid ${isDark ? '#374151' : '#d1fae5'}`,
        color: isDark ? '#E0E0E0' : '#0f172a',
      },
    })
  }

  return (
    <div className={`flex h-full min-h-0 flex-1 flex-col ${drawerBg}`}>
      <div className={`flex shrink-0 items-center justify-between gap-3 border-b px-4 py-3 ${borderBar} ${drawerBg}`}>
        <p className={`text-lg font-bold ${isDark ? 'text-[#E0E0E0]' : 'text-gray-900'}`}>QUEHAYHOY</p>
        <button
          type="button"
          onClick={onClose}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
            isDark ? 'hover:bg-white/10' : 'hover:bg-black/5'
          }`}
          aria-label="Cerrar menú"
        >
          <X className={`h-6 w-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`} strokeWidth={2} />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col px-5">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <header className="flex flex-col items-center pt-6 md:pt-4">
          {user ? (
            <p className={`mb-8 text-center text-base ${greetingCls}`}>
              Hola, {user.displayName ?? user.email ?? 'usuario'}
            </p>
          ) : (
            <div className="mb-8 flex w-full max-w-sm flex-col items-center">
              <button
                type="button"
                onClick={handleGoogle}
                className={`flex w-full items-center justify-center gap-3 rounded-full py-4 pl-5 pr-6 text-base font-semibold transition active:scale-[0.98] ${googleBtnCls}`}
              >
                <GoogleLogo className="h-7 w-7 shrink-0" />
                Continuar con Google
              </button>
              <p className="mt-2 pt-2 text-center text-xs text-gray-400">
                - Para disfrutar la experiencia completa -
              </p>
            </div>
          )}
        </header>

        <section className="mt-0">
          <SettingsRow isDark={isDark} icon={Compass} label="Explorar" onClick={() => showComingSoon('explore')} />
          <SettingsRow isDark={isDark} icon={Heart} label="Favoritos" onClick={goFavoritos} />
          <SettingsRow isDark={isDark} icon={MapPin} label="Sectores Favoritos" onClick={goSectores} />
          <SettingsRow
            isDark={isDark}
            icon={Tags}
            label="Categorías Favoritas"
            onClick={goCategorias}
            withBorder={false}
          />
        </section>
        </div>

        <p
          className={`mt-auto py-6 text-center text-xs font-extralight tracking-wide ${
            isDark ? 'text-gray-500' : 'text-gray-400'
          }`}
          aria-label={`Versión ${APP_VERSION}`}
        >
          {APP_VERSION}
        </p>
      </div>
    </div>
  )
}

export default DesktopProfileMenuContent
