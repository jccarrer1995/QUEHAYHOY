import { Toaster } from 'sonner'
import { useTheme } from '../../contexts/ThemeContext'

export function AppToaster() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <Toaster
      position="top-right"
      richColors
      toastOptions={{
        style: {
          background: isDark ? '#121212' : '#ffffff',
          border: `1px solid ${isDark ? '#374151' : '#d1fae5'}`,
          color: isDark ? '#E0E0E0' : '#0f172a',
        },
      }}
    />
  )
}

export default AppToaster
