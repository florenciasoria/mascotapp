import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import Notice from '@/components/ui/Notice'
import StarDisplay from '@/components/ratings/StarDisplay'
import { useAuth } from '@/hooks/useAuth'
import { countPendingRequests } from '@/services/adoptionService'
import { getShelterRatingSummary } from '@/services/ratingService'
import { syncShelterPublicProfile } from '@/services/shelterService'
import { getShelterDonationSummary } from '@/services/donationService'
import { formatCurrency } from '@/utils/donationOptions'
import styles from '@/pages/shared/HomeCards.module.css'

/** Inicio del refugio: avisos, donaciones y calificación. */
function ShelterHomePage() {
  const { user, profile } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)
  const [ratingSummary, setRatingSummary] = useState(null)
  const [donationSummary, setDonationSummary] = useState(null)

  // Los avisos y resúmenes son secundarios: si fallan, no se muestran
  useEffect(() => {
    let isActive = true
    countPendingRequests(user.uid)
      .then((count) => isActive && setPendingCount(count))
      .catch(() => {})

    getShelterRatingSummary(user.uid)
      .then((summary) => isActive && setRatingSummary(summary))
      .catch(() => {})

    getShelterDonationSummary(user.uid)
      .then((summary) => isActive && setDonationSummary(summary))
      .catch(() => {})

    return () => {
      isActive = false
    }
  }, [user.uid])

  // Publica o actualiza el perfil público del refugio (también al reactivarse); si no hay cambios, no escribe
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
        title={
          <>
            ¡Hola, {profile.name}! <span aria-hidden="true">👋</span>
          </>
        }
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
        <div className={styles.stats}>
          <Card as="section" aria-labelledby="donations-title">
            <h2 id="donations-title" className={styles.cardTitle}>
              Donaciones
            </h2>
            {donationSummary?.total > 0 ? (
              <>
                <p className={styles.statValue}>{formatCurrency(donationSummary.amount)}</p>
                <p className={styles.statDetail}>
                  {donationSummary.total === 1
                    ? '1 donación recibida'
                    : `${donationSummary.total} donaciones recibidas`}
                </p>
              </>
            ) : (
              <>
                <p className={styles.statValue}>$0</p>
                <p className={styles.statDetail}>Todavía no recibiste donaciones</p>
              </>
            )}
            <Link to="/refugio/donaciones" className={styles.statLink}>
              Ver más <span aria-hidden="true">→</span>
            </Link>
          </Card>

          <Card as="section" aria-labelledby="rating-title">
            <h2 id="rating-title" className={styles.cardTitle}>
              Calificación
            </h2>
            {ratingSummary?.total > 0 ? (
              <>
                {/* Promedio general de los dos puntajes */}
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
          <h2 id="manage-pets-title" className={styles.cardTitle}>
            Gestioná tus mascotas
          </h2>
          <p className={styles.cardText}>
            Registrá y actualizá mascotas disponibles para adopción.
          </p>
          <div className={styles.cardAction}>
            <ButtonLink to="/refugio/mascotas">Ver mascotas</ButtonLink>
          </div>
        </Card>

        <Card as="section" aria-labelledby="requests-title">
          <h2 id="requests-title" className={styles.cardTitle}>
            Revisá las solicitudes
          </h2>
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
