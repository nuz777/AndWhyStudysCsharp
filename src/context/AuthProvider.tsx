import { useState } from 'react'
import type { ReactNode } from 'react'
import { AuthContext } from './authContextInstance'

const AUTH_STORAGE_KEY = 'andwhy_csharp_auth_v1'
const CORRECT_PASSWORD = 'ivanDavid2007'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false)
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null)

  const login = (password: string): boolean => {
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      try {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
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

  const logout = () => {
    setIsAuthenticated(false)
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
        login,
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
