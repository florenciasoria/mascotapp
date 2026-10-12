import { Link } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import { useAuth } from '@/hooks/useAuth'
import styles from '@/pages/shared/HomeCards.module.css'

function ShelterHomePage() {
  const { profile } = useAuth()

  return (
    <>
      <PageHeader
        title={<>¡Hola, {profile.name}! <span aria-hidden="true">👋</span></>}
        subtitle="Gestioná las actividades de tu refugio."
      />

      <div className={styles.cards}>
        {/* Los datos de donaciones y calificaciones se conectan en los hitos 5 y 6 */}
        <div className={styles.stats}>
          <Card as="section" aria-labelledby="donations-title">
            <h2 id="donations-title" className={styles.cardTitle}>Donaciones</h2>
            <p className={styles.statValue}>$0</p>
            <p className={styles.statDetail}>Todavía no recibiste donaciones</p>
            <Link to="/refugio/donaciones" className={styles.statLink}>
              Ver más <span aria-hidden="true">→</span>
            </Link>
          </Card>

          <Card as="section" aria-labelledby="rating-title">
            <h2 id="rating-title" className={styles.cardTitle}>Calificación</h2>
            <p className={styles.statValue}>Sin calificaciones</p>
            <p className={styles.statDetail}>Todavía no recibiste calificaciones</p>
            <Link to="/refugio/calificaciones" className={styles.statLink}>
              Ver más <span aria-hidden="true">→</span>
            </Link>
          </Card>
        </div>

        <Card as="section" aria-labelledby="manage-pets-title">
          <h2 id="manage-pets-title" className={styles.cardTitle}>Gestioná tus mascotas</h2>
          <p className={styles.cardText}>Registrá y actualizá mascotas disponibles para adopción.</p>
          <div className={styles.cardAction}>
            <ButtonLink to="/refugio/mascotas">Ver mascotas</ButtonLink>
          </div>
        </Card>

        <Card as="section" aria-labelledby="requests-title">
          <h2 id="requests-title" className={styles.cardTitle}>Revisá las solicitudes</h2>
          <p className={styles.cardText}>Consultá y gestioná las solicitudes recibidas.</p>
          <div className={styles.cardAction}>
            <ButtonLink to="/refugio/solicitudes" variant="secondary">
              Ver solicitudes
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  )
}

export default ShelterHomePage
