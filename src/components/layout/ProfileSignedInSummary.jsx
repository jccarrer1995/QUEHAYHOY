/**
 * Avatar circular y nombre cuando hay sesión (perfil / drawer desktop).
 */
import { User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'
import { resolveAuthUserForDisplay } from '../../lib/authDisplayUser.js'

/**
 * @param {{ className?: string }} props
 */
export function ProfileSignedInSummary({ className = '' }) {
  const { user: contextUser, photoURL: contextPhotoURL, displayName } = useAuth()
  /** El padre (`ProfileMenuContent` / drawer) ya suscribe con `useAuthUserForProfileHeader`; aquí solo resolvemos. */
  const user = resolveAuthUserForDisplay(contextUser)
  const photoURL = contextPhotoURL ?? user?.photoURL ?? null
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const mediaKey = `${user?.uid ?? ''}|${photoURL ?? ''}`
  const [brokenMediaKey, setBrokenMediaKey] = useState(null)

  if (!user) {
    return null
  }

  const name =
    (typeof displayName === 'string' && displayName.trim() !== ''
      ? displayName.trim()
      : null) ||
    (typeof user.displayName === 'string' && user.displayName.trim() !== ''
      ? user.displayName.trim()
      : null) ||
    user.email ||
    'Usuario'

  const showPhoto = Boolean(photoURL) && brokenMediaKey !== mediaKey
  const ringCls = isDark ? 'ring-2 ring-white/15 ring-offset-2 ring-offset-[#121212]' : 'ring-2 ring-black/10 ring-offset-2 ring-offset-white'
  const placeholderBg = isDark ? 'bg-gray-700' : 'bg-gray-200'
  const iconCls = isDark ? 'text-gray-400' : 'text-gray-500'
  const nameCls = isDark ? 'text-[#E0E0E0]' : 'text-gray-900'

  return (
    <div className={`flex w-full flex-col items-center px-1 ${className || 'mb-8'}`}>
      <div
        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-full ${ringCls} ${!showPhoto ? placeholderBg : ''}`}
      >
        {showPhoto ? (
          <img
            src={photoURL}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
            onError={() => setBrokenMediaKey(mediaKey)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center" aria-hidden>
            <User className={`h-10 w-10 ${iconCls}`} strokeWidth={1.5} />
          </span>
        )}
      </div>
      <p className={`mt-3 max-w-full truncate text-center text-base font-semibold ${nameCls}`}>{name}</p>
    </div>
  )
}
