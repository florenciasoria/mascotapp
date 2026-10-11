import { useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { subscribeToAuthChanges, subscribeToUserProfile } from '../services/authService'

// Mantiene actualizada la sesión y el perfil del usuario para toda la app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribeProfile = () => {}

    const unsubscribeAuth = subscribeToAuthChanges((firebaseUser) => {
      // Si cambió el usuario, dejamos de escuchar el perfil anterior
      unsubscribeProfile()
      setUser(firebaseUser)

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

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}