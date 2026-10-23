import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import { getPublicShelters } from '@/services/shelterService'
import styles from './DonationSheltersPage.module.css'
import ShelterRatings from '@/components/ratings/ShelterRatings'

/** Elección del refugio para donar: refugios activos con su calificación. */
function DonationSheltersPage() {
  const [shelters, setShelters] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isActive = true

    getPublicShelters()
      .then((result) => isActive && setShelters(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [])

  return (
    <>
      <PageHeader
        title="Realizar donación"
        subtitle="Elegí un refugio para realizar tu donación."
      />

      {isLoading && <p role="status">Cargando refugios…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar los refugios. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && shelters.length === 0 && (
        <p>Todavía no hay refugios para donar.</p>
      )}

      {shelters.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Refugios</h2>
          <ul className={styles.grid}>
            {shelters.map((shelter) => (
              <li key={shelter.id}>
                <Card
                  as="article"
                  className={styles.card}
                  aria-labelledby={`shelter-${shelter.id}`}
                >
                  <h3 id={`shelter-${shelter.id}`} className={styles.name}>
                    {shelter.name}
                  </h3>
                  <p className={styles.neighborhood}>
                    <span aria-hidden="true">📍</span> {shelter.neighborhood}
                  </p>

                  <ShelterRatings shelterId={shelter.id} compact />

                  <p className={styles.about}>{shelter.about}</p>
                  <div className={styles.action}>
                    <ButtonLink
                      to={`/adoptante/donaciones/nueva/${shelter.id}`}
                      size="sm"
                      aria-label={`Donar a ${shelter.name}`}
                    >
                      Donar
                    </ButtonLink>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export default DonationSheltersPage
