import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { FavoriteLoginSheet } from '../components/layout/FavoriteLoginSheet.jsx'
import { useAuth } from './AuthContext.jsx'

const FavoriteLoginPromptContext = createContext({
  openFavoriteLoginPrompt: () => {},
})

export function FavoriteLoginPromptProvider({ children }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (user && open) setOpen(false)
  }, [user, open])

  const openFavoriteLoginPrompt = useCallback(() => {
    setOpen(true)
  }, [])

  const value = useMemo(
    () => ({ openFavoriteLoginPrompt }),
    [openFavoriteLoginPrompt]
  )

  return (
    <FavoriteLoginPromptContext.Provider value={value}>
      {children}
      <FavoriteLoginSheet open={open} onClose={() => setOpen(false)} />
    </FavoriteLoginPromptContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- hook ligado al provider
export function useFavoriteLoginPrompt() {
  return useContext(FavoriteLoginPromptContext)
}
