import { createContext } from 'react'

// Contexto con la sesión actual: { user, profile, isLoading, isEmailVerified, refreshEmailVerification }
export const AuthContext = createContext(null)
