import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

/**
 * Devuelve la sesión actual. Debe usarse dentro de AuthProvider.
 * @returns {{user: object|null, profile: object|null, isLoading: boolean, isEmailVerified: boolean, refreshEmailVerification: () => Promise<boolean>}}
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
