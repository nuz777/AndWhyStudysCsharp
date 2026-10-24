import { createContext } from 'react'

export interface AuthContextType {
  isAuthenticated: boolean
  login: (password: string) => boolean
  logout: () => void
  isAccessModalOpen: boolean
  openAccessModal: (onSuccessAction?: () => void) => void
  closeAccessModal: () => void
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)
