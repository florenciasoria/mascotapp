import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import ButtonLink from '@/components/ui/ButtonLink'
import RequestCard from '@/components/requests/RequestCard'
import { useAuth } from '@/hooks/useAuth'
import { getShelterRequests } from '@/services/adoptionService'
import {
  filterRequestsByStatus,
  REQUEST_STATUS_OPTIONS,
  sortRequestsPendingFirst,
} from '@/utils/requestFilters'
import styles from './ShelterRequestsPage.module.css'

function ShelterRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')

  // Carga las solicitudes del refugio al entrar a la pantalla
  useEffect(() => {
    let isActive = true

    getShelterRequests(user.uid)
      .then((result) => isActive && setRequests(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  // Pendientes primero: son las que el refugio tiene que revisar
  const visibleRequests = sortRequestsPendingFirst(filterRequestsByStatus(requests, statusFilter))

  return (
    <>
      <PageHeader
        title="Solicitudes de adopción"
        subtitle="Revisá las solicitudes que recibieron tus mascotas."
      />

      {isLoading && <p role="status">Cargando solicitudes…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar las solicitudes. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && requests.length === 0 && (
        <p>Todavía no recibiste solicitudes de adopción.</p>
      )}

      {requests.length > 0 && (
        <>
          <div className={styles.filter}>
            <Select
              label="Estado"
              name="status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              options={REQUEST_STATUS_OPTIONS}
            />
          </div>

          <p role="status" className={styles.count}>
            {visibleRequests.length === 1 ? '1 solicitud' : `${visibleRequests.length} solicitudes`}
          </p>

          {visibleRequests.length === 0 ? (
            <p>No hay solicitudes con ese estado.</p>
          ) : (
            <ul className={styles.grid}>
              {visibleRequests.map((request) => (
                <li key={request.id}>
                  <RequestCard
                    request={request}
                    subtitle={`Solicitada por ${request.adopterName}`}
                    highlightPending
                  >
                    <ButtonLink
                      to={`/refugio/solicitudes/${request.id}`}
                      size="sm"
                      aria-label={`Ver solicitud de ${request.adopterName} para ${request.pet.name}`}
                    >
                      Ver solicitud
                    </ButtonLink>
                  </RequestCard>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}

export default ShelterRequestsPage
