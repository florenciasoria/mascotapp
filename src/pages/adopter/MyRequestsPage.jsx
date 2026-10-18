import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResultDialog from '@/components/ui/ResultDialog'
import ButtonLink from '@/components/ui/ButtonLink'
import Select from '@/components/ui/Select'
import RequestCard from '@/components/requests/RequestCard'
import { useAuth } from '@/hooks/useAuth'
import { cancelAdoptionRequest, getAdopterRequests } from '@/services/adoptionService'
import { REQUEST_STATUS } from '@/utils/requestOptions'
import { filterRequestsByStatus, REQUEST_STATUS_OPTIONS } from '@/utils/requestFilters'
import styles from './MyRequestsPage.module.css'

function MyRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const visibleRequests = filterRequestsByStatus(requests, statusFilter)

  // Carga las solicitudes del adoptante al entrar a la pantalla
  useEffect(() => {
    let isActive = true

    getAdopterRequests(user.uid)
      .then((result) => isActive && setRequests(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  async function handleConfirmCancel() {
    setIsCancelling(true)
    try {
      await cancelAdoptionRequest(requestToCancel.id)
      // Se actualiza la tarjeta en pantalla sin volver a cargar toda la lista
      setRequests((current) =>
        current.map((item) =>
          item.id === requestToCancel.id ? { ...item, status: REQUEST_STATUS.CANCELLED } : item,
        ),
      )
    } catch {
      setErrorMessage(
        `No pudimos cancelar tu solicitud para ${requestToCancel.pet.name}. Intentá nuevamente.`,
      )
    } finally {
      setIsCancelling(false)
      setRequestToCancel(null)
    }
  }

  return (
    <>
      <PageHeader
        title="Mis solicitudes"
        subtitle="Seguí el estado de las solicitudes de adopción que enviaste."
      />

      {isLoading && <p role="status">Cargando solicitudes…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar tus solicitudes. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && requests.length === 0 && (
        <p>
          Todavía no enviaste solicitudes.{' '}
          <Link to="/adoptante/buscar">Buscá una mascota para adoptar</Link>.
        </p>
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
            <p>No tenés solicitudes con ese estado.</p>
          ) : (
            <ul className={styles.grid}>
              {visibleRequests.map((request) => (
                <li key={request.id}>
                  <RequestCard request={request} subtitle={request.shelterName} highlightNew>
                    {/* Solo se puede cancelar mientras el refugio no decidió */}
                    {request.status === REQUEST_STATUS.PENDING && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setRequestToCancel(request)}
                        aria-label={`Cancelar solicitud para ${request.pet.name}`}
                      >
                        Cancelar
                      </Button>
                    )}
                    <ButtonLink
                      to={`/adoptante/solicitudes/${request.id}`}
                      size="sm"
                      aria-label={`Ver solicitud para ${request.pet.name}`}
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

      <ConfirmDialog
        isOpen={requestToCancel !== null}
        onClose={() => setRequestToCancel(null)}
        onConfirm={handleConfirmCancel}
        title={`¿Cancelar tu solicitud para adoptar a ${requestToCancel?.pet.name ?? ''}?`}
        message="El refugio ya no la va a revisar. Si cambiás de opinión, podés volver a solicitarla."
        confirmLabel="Cancelar solicitud"
        cancelLabel="Volver"
        isLoading={isCancelling}
      />

      <ResultDialog
        isOpen={errorMessage !== ''}
        onClose={() => setErrorMessage('')}
        type="error"
        title="¡Error!"
        message={errorMessage}
      />
    </>
  )
}

export default MyRequestsPage
