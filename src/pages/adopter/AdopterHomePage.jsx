import { useLocation } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import { useAuth } from '@/hooks/useAuth'
import styles from '@/pages/shared/HomeCards.module.css'

function AdopterHomePage() {
  const { profile } = useAuth()
  const location = useLocation()
  const justRegistered = location.state?.justRegistered
  const firstName = profile.name.split(' ')[0]

  return (
    <>
      {justRegistered && (
        <p className={styles.welcome} role="status">
          ¡Tu cuenta fue creada! Ya podés empezar a buscar a tu compañero.
        </p>
      )}

      <PageHeader
        title={<>¡Hola, {firstName}! <span aria-hidden="true">👋</span></>}
        subtitle="Todo lo que necesitás para adoptar y ayudar está acá."
      />

      <div className={styles.cards}>
        <Card as="section" aria-labelledby="find-pet-title">
          <h2 id="find-pet-title" className={styles.cardTitle}>Encontrá a tu próximo compañero</h2>
          <p className={styles.cardText}>Explorá las mascotas disponibles para adopción.</p>
          <div className={styles.cardAction}>
            <ButtonLink to="/adoptante/buscar">Buscar mascotas</ButtonLink>
          </div>
        </Card>

        <Card as="section" aria-labelledby="help-shelter-title">
          <h2 id="help-shelter-title" className={styles.cardTitle}>Ayudá a un refugio</h2>
          <p className={styles.cardText}>Colaborá con un refugio y ayudá a más mascotas.</p>
          <div className={styles.cardAction}>
            <ButtonLink to="/adoptante/donaciones" variant="secondary">
              Realizar donación
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  )
}

export default AdopterHomePage
