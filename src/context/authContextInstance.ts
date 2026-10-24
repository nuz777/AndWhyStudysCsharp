import { createContext } from 'react'

export type UserRole = 'admin' | 'explorer' | null

export interface AuthContextType {
  isAuthenticated: boolean // true si tiene rol admin
  isExplorer: boolean // true si está en modo explorador (solo lectura)
  role: UserRole
  login: (password: string) => boolean
  loginAsExplorer: () => void
  logout: () => void
  isAccessModalOpen: boolean
  openAccessModal: (onSuccessAction?: () => void) => void
  closeAccessModal: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
