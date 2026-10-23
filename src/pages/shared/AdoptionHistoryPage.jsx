import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import ButtonLink from '@/components/ui/ButtonLink'
import RequestCard from '@/components/requests/RequestCard'
import StarDisplay from '@/components/ratings/StarDisplay'
import { useAuth } from '@/hooks/useAuth'
import { getAdopterAdoptions, getShelterAdoptions } from '@/services/adoptionService'
import { getAdopterRatings } from '@/services/ratingService'
import { ROLES } from '@/utils/roles'
import styles from './AdoptionHistoryPage.module.css'

// Configuración del historial según el rol
const HISTORY_BY_ROLE = {
  [ROLES.ADOPTER]: {
    subtitle: 'Las adopciones que los refugios aceptaron.',
    load: getAdopterAdoptions,
    getCardSubtitle: (request) => request.shelterName,
    detailPath: '/adoptante/solicitudes',
    empty: 'Todavía no tenés adopciones aceptadas.',
    emptyLink: { to: '/adoptante/buscar', label: 'Buscá una mascota para adoptar' },
    canRate: true,
  },
  [ROLES.SHELTER]: {
    subtitle: 'Las adopciones que aceptaste.',
    load: getShelterAdoptions,
    getCardSubtitle: (request) => `Adoptada por ${request.adopterName}`,
    detailPath: '/refugio/solicitudes',
    empty: 'Todavía no aceptaste solicitudes de adopción.',
    emptyLink: { to: '/refugio/solicitudes', label: 'Revisá las solicitudes recibidas' },
    canRate: false,
  },
}

/** Historial de adopciones aceptadas (CU009), para el adoptante y el refugio. */
function AdoptionHistoryPage() {
  const { user, profile } = useAuth()
  const config = HISTORY_BY_ROLE[profile.role]
  const location = useLocation()
  const [adoptions, setAdoptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [ratingsById, setRatingsById] = useState({})

  useEffect(() => {
    let isActive = true

    // El adoptante también trae sus calificaciones, para saber cuáles ya calificó
    Promise.all([config.load(user.uid), config.canRate ? getAdopterRatings(user.uid) : []])
      .then(([result, ratings]) => {
        if (!isActive) return
        setAdoptions(result)
        setRatingsById(Object.fromEntries(ratings.map((rating) => [rating.id, rating])))
      })
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [config, user.uid])

  return (
    <>
      <PageHeader title="Historial de adopciones" subtitle={config.subtitle} />

      {isLoading && <p role="status">Cargando adopciones…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar el historial. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && adoptions.length === 0 && (
        <p>
          {config.empty} <Link to={config.emptyLink.to}>{config.emptyLink.label}</Link>.
        </p>
      )}

      {adoptions.length > 0 && (
        <ul className={styles.grid}>
          {adoptions.map((request) => (
            <li key={request.id}>
              <RequestCard
                request={request}
                subtitle={config.getCardSubtitle(request)}
                statusLabel="Adopción aceptada"
              >
                {ratingsById[request.id] && (
                  <div className={styles.myRating}>
                    <p className={styles.myRatingTitle}>Tu calificación</p>
                    <p className={styles.scoreRow}>
                      Atención del refugio{' '}
                      <StarDisplay value={ratingsById[request.id].shelterScore} />
                    </p>
                    <p className={styles.scoreRow}>
                      Proceso de adopción{' '}
                      <StarDisplay value={ratingsById[request.id].processScore} />
                    </p>
                  </div>
                )}
                <ButtonLink
                  to={`${config.detailPath}/${request.id}`}
                  state={{ backTo: location.pathname }}
                  variant={config.canRate && !ratingsById[request.id] ? 'secondary' : 'primary'}
                  size="sm"
                  aria-label={`Ver solicitud de adopción de ${request.pet.name}`}
                >
                  Ver solicitud
                </ButtonLink>
                {config.canRate && !ratingsById[request.id] && (
                  <ButtonLink
                    to={`/adoptante/historial/${request.id}/calificar`}
                    size="sm"
                    aria-label={`Calificar la adopción de ${request.pet.name}`}
                  >
                    Calificar
                  </ButtonLink>
                )}
              </RequestCard>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default AdoptionHistoryPage
