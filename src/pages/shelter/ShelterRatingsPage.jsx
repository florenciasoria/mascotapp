import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import StarDisplay from '@/components/ratings/StarDisplay'
import { useAuth } from '@/hooks/useAuth'
import { getShelterRatings, getShelterRatingSummary } from '@/services/ratingService'
import { formatDate } from '@/utils/dates'
import styles from './ShelterRatingsPage.module.css'

function ShelterRatingsPage() {
  const { user } = useAuth()
  const [ratings, setRatings] = useState([])
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Las opiniones y los promedios (calculados en el servidor) se buscan a la vez
  useEffect(() => {
    let isActive = true

    Promise.all([getShelterRatings(user.uid), getShelterRatingSummary(user.uid)])
      .then(([list, totals]) => {
        if (!isActive) return
        setRatings(list)
        setSummary(totals)
      })
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  return (
    <>
      <PageHeader
        title="Calificaciones recibidas"
        subtitle="Lo que opinan los adoptantes sobre tu refugio."
      />

      {isLoading && <p role="status">Cargando calificaciones…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar las calificaciones. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && ratings.length === 0 && (
        <p>
          Todavía no recibiste calificaciones. Aparecen cuando un adoptante califica una adopción
          aceptada.
        </p>
      )}

      {ratings.length > 0 && summary && (
        <>
          <section aria-labelledby="summary-title">
            <h2 id="summary-title" className={styles.sectionTitle}>
              Promedios
            </h2>
            <div className={styles.summary}>
              <Card className={styles.stat}>
                <p className={styles.statLabel}>Atención del refugio</p>
                <StarDisplay value={summary.shelterAverage} showValue />
              </Card>
              <Card className={styles.stat}>
                <p className={styles.statLabel}>Proceso de adopción</p>
                <StarDisplay value={summary.processAverage} showValue />
              </Card>
              <Card className={styles.stat}>
                <p className={styles.statLabel}>Calificaciones recibidas</p>
                <p className={styles.statValue}>{summary.total}</p>
              </Card>
            </div>
          </section>

          <section aria-labelledby="opinions-title">
            <h2 id="opinions-title" className={styles.sectionTitle}>
              Opiniones
            </h2>
            <ul className={styles.list}>
              {ratings.map((rating) => (
                <li key={rating.id}>
                  <Card
                    as="article"
                    className={styles.rating}
                    aria-labelledby={`rating-${rating.id}`}
                  >
                    <h3 id={`rating-${rating.id}`} className={styles.ratingTitle}>
                      {rating.adopterName} · adopción de {rating.petName}
                    </h3>
                    <p className={styles.date}>{formatDate(rating.createdAt)}</p>
                    <p className={styles.scoreRow}>
                      Atención del refugio <StarDisplay value={rating.shelterScore} />
                    </p>
                    <p className={styles.scoreRow}>
                      Proceso de adopción <StarDisplay value={rating.processScore} />
                    </p>
                    {rating.comment && (
                      <blockquote className={styles.comment}>{rating.comment}</blockquote>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  )
}

export default ShelterRatingsPage
