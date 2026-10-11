import { useLocation } from 'react-router'
import LogoutButton from '@/components/LogoutButton'
import { useAuth } from '@/hooks/useAuth'
import styles from './AdopterHomePage.module.css'

function AdopterHomePage() {
  const { profile } = useAuth()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered

  return (
    <main>
      {justRegistered && (
        <p className={styles.welcome} role="status">
          ¡Tu cuenta fue creada! Ya podés empezar a buscar a tu compañero.
        </p>
      )}
      <h1>Área del adoptante</h1>
      <p>Hola, {profile?.name}</p>
      <LogoutButton />
    </main>
  )
}

export default AdopterHomePage
