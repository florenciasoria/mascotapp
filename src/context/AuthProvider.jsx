import { useEffect, useState } from 'react'
import {
  checkEmailVerified,
  subscribeToAuthChanges,
  subscribeToUserProfile,
} from '@/services/authService'
import { markEmailVerified } from '@/services/userService'
import { AuthContext } from './AuthContext'

/**
 * Mantiene la sesión y el perfil del usuario (en tiempo real) y los comparte con toda la app.
 * @param {object} props
 * @param {React.ReactNode} props.children - La aplicación.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      // Al cambiar de usuario, se deja de escuchar el perfil anterior
      unsubscribeProfile()
      setUser(firebaseUser)
      setIsEmailVerified(firebaseUser?.emailVerified ?? false)

      if (!firebaseUser) {
        setProfile(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (userProfile) => {
        setProfile(userProfile)
        setIsLoading(false)
      })
    })

    // Cancela las suscripciones al desmontar
    return () => {
      unsubscribeProfile()
      unsubscribeAuth()
    }
  }, [])

  // Registra en el perfil la verificación del email, para que el admin y las reglas la conozcan
  useEffect(() => {
    if (user && isEmailVerified && profile && !profile.emailVerified) {
      markEmailVerified(user.uid).catch(() => {})
    }
  }, [user, isEmailVerified, profile])

  // Vuelve a consultar la verificación (pantalla "Verificá tu email")
  async function refreshEmailVerification() {
    const verified = await checkEmailVerified()
    setIsEmailVerified(verified)
    return verified
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, isLoading, isEmailVerified, refreshEmailVerification }}
    >
      {children}
    </AuthContext.Provider>
  )
}
