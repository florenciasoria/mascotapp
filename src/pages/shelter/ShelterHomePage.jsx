import { Link } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import { useAuth } from '@/hooks/useAuth'
import styles from '@/pages/shared/HomeCards.module.css'
import { useEffect, useState } from 'react'
import Notice from '@/components/ui/Notice'
import { countPendingRequests } from '@/services/adoptionService'
import StarDisplay from '@/components/ratings/StarDisplay'
import { getShelterRatingSummary } from '@/services/ratingService'
import { syncShelterPublicProfile } from '@/services/shelterService'

function ShelterHomePage() {
  const { user, profile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [ratingSummary, setRatingSummary] = useState(null)

  // Los avisos y el resumen son secundarios: si fallan, simplemente no se muestran
  useEffect(() => {
    let isActive = true
    countPendingRequests(user.uid)
      .then((count) => isActive && setPendingCount(count))
      .catch(() => {})

    getShelterRatingSummary(user.uid)
      .then((summary) => isActive && setRatingSummary(summary))
      .catch(() => {})

    return () => {
      isActive = false
    }
  }, [user.uid])

  // Al entrar, el refugio aprobado publica (o actualiza) su perfil público para los adoptantes.
  // Así también aparecen los refugios aprobados antes de que existiera el perfil público,
  // y los que se reactivan. Si ya está al día, no escribe nada.
  useEffect(() => {
    syncShelterPublicProfile(user.uid, {
      name: profile.name,
      neighborhood: profile.neighborhood,
      about: profile.about,
    }).catch(() => {})
  }, [user.uid, profile.name, profile.neighborhood, profile.about])


  return (
    <>
      <PageHeader
        title={<>¡Hola, {profile.name}! <span aria-hidden="true">👋</span></>}
        subtitle="Gestioná las actividades de tu refugio."
      />

      {pendingCount > 0 && (
        <Notice to="/refugio/solicitudes" actionLabel="Ver solicitudes">
          {pendingCount === 1
            ? 'Tenés 1 solicitud pendiente de revisar.'
            : `Tenés ${pendingCount} solicitudes pendientes de revisar.`}
        </Notice>
      )}

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
            {ratingSummary?.total > 0 ? (
              <>
                {/* Promedio general: el promedio de los dos puntajes */}
                <p className={styles.statValue}>
                  <StarDisplay
                    value={(ratingSummary.shelterAverage + ratingSummary.processAverage) / 2}
                    showValue
                  />
                </p>
                <p className={styles.statDetail}>
                  {ratingSummary.total === 1
                    ? 'Basado en 1 calificación'
                    : `Basado en ${ratingSummary.total} calificaciones`}
                </p>
              </>
            ) : (
              <>
                <p className={styles.statValue}>Sin calificaciones</p>
                <p className={styles.statDetail}>Todavía no recibiste calificaciones</p>
              </>
            )}
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
