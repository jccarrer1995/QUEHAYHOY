import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Building2 } from 'lucide-react'
import { BottomNav, DesktopNavbar } from '../components/layout'
import { useTheme } from '../contexts/ThemeContext.jsx'

/**
 * Gestión de organizadores (Admin). Placeholder hasta conectar listado Firestore.
 */
export function AdminOrganizersPage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const shellCls = isDark ? 'min-h-screen bg-[#121212] text-[#E0E0E0]' : 'min-h-screen bg-[#f8fafc] text-gray-900'
  const cardCls = isDark
    ? 'rounded-2xl border border-gray-800 bg-[#161616] shadow-sm'
    : 'rounded-2xl border border-gray-100 bg-white shadow-sm'
  const titleCls = isDark ? 'text-[#E0E0E0]' : 'text-[#0a0a0a]'
  const mutedCls = isDark ? 'text-gray-400' : 'text-gray-600'

  return (
    <div className={`flex flex-col pb-20 md:pb-0 ${shellCls}`}>
      <DesktopNavbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <button
          type="button"
          onClick={() => navigate('/perfil')}
          className={`mb-4 inline-flex items-center gap-2 text-sm font-medium ${mutedCls}`}
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Perfil
        </button>

        <article className={`${cardCls} p-6`}>
          <div className="flex items-center gap-3">
            <span className="inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Building2 className="h-5 w-5" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h1 className={`text-xl font-bold ${titleCls}`} style={{ color: isDark ? '#E0E0E0' : '#0a0a0a' }}>
                Organizadores
              </h1>
              <p className={`mt-0.5 text-sm ${mutedCls}`}>Gestión global de creadores en la plataforma</p>
            </div>
          </div>
          <p className={`mt-6 text-sm leading-relaxed ${mutedCls}`}>
            Próximamente podrás verificar, aprobar y administrar todos los organizadores registrados.
          </p>
        </article>
      </main>
      <BottomNav activeTab="profile" onTabChange={() => {}} />
    </div>
  )
}

export default AdminOrganizersPage
