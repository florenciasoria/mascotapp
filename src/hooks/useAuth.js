import { useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'

// Acceso a la sesión desde cualquier componente:
// const { user, profile } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  }
  return context
}
