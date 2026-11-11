import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/router'
import { getCurrentUser, signOut, updateSession } from './supabase'
import type { Profile } from './types'

type AuthState = {
  user: Profile | null
  loading: boolean
  refresh: () => Promise<Profile | null>
  setUser: (profile: Profile | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  refresh: async () => null,
  setUser: () => {},
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUserState] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const current = await getCurrentUser()
    setUserState(current)
    setLoading(false)
    return current
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const setUser = useCallback((profile: Profile | null) => {
    setUserState(profile)
    if (profile) updateSession(profile)
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    setUserState(null)
    router.replace('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, refresh, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
