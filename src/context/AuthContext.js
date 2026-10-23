import { createContext } from 'react'

// Contexto de la sesión: { user, profile, isLoading, isEmailVerified, refreshEmailVerification }
export const AuthContext = createContext(null)
