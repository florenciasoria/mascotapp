import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  checkEmailVerified,
  subscribeToAuthChanges,
  subscribeToUserProfile,
} from '@/services/authService'
import { markEmailVerified } from '../services/userService'

// Mantiene actualizada la sesión y el perfil del usuario para toda la app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)


  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      // Si cambió el usuario, dejamos de escuchar el perfil anterior
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
    

    // Al desmontar, cortamos ambas suscripciones (evita pérdidas de memoria)
    return () => {
      unsubscribeProfile()
      unsubscribeAuth()
    }
  }, [])

  // Si el email está verificado pero el perfil todavía no lo dice, lo guardamos.
  // Pasa al verificar o, para cuentas ya verificadas, en el próximo inicio de sesión.
  useEffect(() => {
    if (user && isEmailVerified && profile && !profile.emailVerified) {
      markEmailVerified(user.uid).catch(() => {})
    }
  }, [user, isEmailVerified, profile])


  // Se llama desde la pantalla "Verificá tu email"
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