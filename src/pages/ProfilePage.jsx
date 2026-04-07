/**
 * Perfil / cuenta — móvil.
 */
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { BottomNav, ProfileMenuContent } from '../components/layout'

export function ProfilePage() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const pageCls = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-white text-gray-900'

  return (
    <div className={`min-h-[100dvh] w-full transition-colors ${pageCls}`}>
      <ProfileMenuContent />

      <BottomNav
        activeTab="profile"
        onTabChange={(id) => {
          if (id === 'home') navigate('/')
        }}
      />
    </div>
  )
}

export default ProfilePage
