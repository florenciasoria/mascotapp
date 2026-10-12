import { useLocation } from 'react-router'
import { useAuth } from '@/hooks/useAuth'
import styles from './AdopterHomePage.module.css'

function AdopterHomePage() {
  const { profile } = useAuth()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered

  return (
    <>
      {justRegistered && (
        <p className={styles.welcome} role="status">
          ¡Tu cuenta fue creada! Ya podés empezar a buscar a tu compañero.
        </p>
      )}
      <h1>Área del adoptante</h1>
      <p>Hola, {profile?.name}</p>
    </>
  )
}

export default AdopterHomePage
