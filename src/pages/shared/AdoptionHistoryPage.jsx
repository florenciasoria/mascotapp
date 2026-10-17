import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import ButtonLink from '@/components/ui/ButtonLink'
import RequestCard from '@/components/requests/RequestCard'
import { useAuth } from '@/hooks/useAuth'
import { getAdopterAdoptions, getShelterAdoptions } from '@/services/adoptionService'
import { ROLES } from '@/utils/roles'
import styles from './AdoptionHistoryPage.module.css'

// Lo que cambia según quién mira el historial
const HISTORY_BY_ROLE = {
  [ROLES.ADOPTER]: {
    subtitle: 'Las adopciones que los refugios aceptaron.',
    load: getAdopterAdoptions,
    getCardSubtitle: (request) => request.shelterName,
    detailPath: '/adoptante/solicitudes',
    empty: 'Todavía no tenés adopciones aceptadas.',
    emptyLink: { to: '/adoptante/buscar', label: 'Buscá una mascota para adoptar' },
  },
  [ROLES.SHELTER]: {
    subtitle: 'Las adopciones que aceptaste.',
    load: getShelterAdoptions,
    getCardSubtitle: (request) => `Adoptada por ${request.adopterName}`,
    detailPath: '/refugio/solicitudes',
    empty: 'Todavía no aceptaste solicitudes de adopción.',
    emptyLink: { to: '/refugio/solicitudes', label: 'Revisá las solicitudes recibidas' },
  },
}

function AdoptionHistoryPage() {
  const { user, profile } = useAuth()
  const config = HISTORY_BY_ROLE[profile.role]
  const location = useLocation()
  const [adoptions, setAdoptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    let isActive = true

    config
      .load(user.uid)
      .then((result) => isActive && setAdoptions(result))
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
                <ButtonLink
                  to={`${config.detailPath}/${request.id}`}
                  state={{ backTo: location.pathname }}
                  size="sm"
                  aria-label={`Ver solicitud de adopción de ${request.pet.name}`}
                >
                  Ver solicitud
                </ButtonLink>
              </RequestCard>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default AdoptionHistoryPage
