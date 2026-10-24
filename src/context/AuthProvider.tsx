import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContextInstance'
import type { UserRole } from './authContextInstance'

const AUTH_STORAGE_KEY = 'andwhy_csharp_auth_v1'
const CORRECT_PASSWORD = 'ivanDavid2007'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(() => {
    try {
      const saved = sessionStorage.getItem(AUTH_STORAGE_KEY)
      if (saved === 'admin' || saved === 'true') return 'admin'
      if (saved === 'explorer') return 'explorer'
      return null
    } catch {
      return null
    }
  })

  const isAuthenticated = role === 'admin'
  const isExplorer = role === 'explorer'

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null)

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setRole('admin')
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'admin')
      } catch {
        // ignore
      }
      setIsAccessModalOpen(false)
      if (pendingCallback) {
        pendingCallback()
        setPendingCallback(null)
      }
      return true
    }
    return false
  }

  const loginAsExplorer = () => {
    setRole('explorer')
    try {
      sessionStorage.setItem(AUTH_STORAGE_KEY, 'explorer')
    } catch {
      // ignore
    }
    setIsAccessModalOpen(false)
    if (pendingCallback) {
      pendingCallback()
      setPendingCallback(null)
    }
  }

  const logout = () => {
    setRole(null)
    try {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } catch {
      // ignore
    }
  }

  const openAccessModal = (onSuccessAction?: () => void) => {
    if (onSuccessAction) {
      setPendingCallback(() => onSuccessAction)
    } else {
      setPendingCallback(null)
    }
    setIsAccessModalOpen(true)
  }

  const closeAccessModal = () => {
    setIsAccessModalOpen(false)
    setPendingCallback(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isExplorer,
        role,
        login,
        loginAsExplorer,
        logout,
        isAccessModalOpen,
        openAccessModal,
        closeAccessModal
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
