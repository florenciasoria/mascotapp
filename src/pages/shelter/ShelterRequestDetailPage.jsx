import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResultDialog from '@/components/ui/ResultDialog'
import RequestCard from '@/components/requests/RequestCard'
import RequestAnswers from '@/components/requests/RequestAnswers'
import { acceptAdoptionRequest, getRequest, rejectAdoptionRequest } from '@/services/adoptionService'
import { REQUEST_STATUS } from '@/utils/requestOptions'
import styles from './ShelterRequestDetailPage.module.css'
import RequestResultBanner from '@/components/requests/RequestResultBanner'


function ShelterRequestDetailPage() {
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [actionToConfirm, setActionToConfirm] = useState(null) // 'accept' | 'reject'
  const [isSaving, setIsSaving] = useState(false)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let isActive = true

    getRequest(requestId)
      .then((result) => isActive && setRequest(result))
      .catch(() => isActive && setRequest(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [requestId])

  async function handleConfirm() {
    const isAccept = actionToConfirm === 'accept'
    setIsSaving(true)
    try {
      if (isAccept) {
        await acceptAdoptionRequest(request)
      } else {
        await rejectAdoptionRequest(request.id)
      }
      // Se vuelve a leer para mostrar la fecha real que puso el servidor
      setRequest(await getRequest(request.id))
      setDialog(
        isAccept
          ? {
              type: 'success',
              title: '¡Solicitud aceptada!',
              message: `${request.pet.name} ya figura como adoptada. Las demás solicitudes pendientes se rechazaron automáticamente.`,
            }
          : {
              type: 'success',
              title: 'Solicitud rechazada',
              message: `${request.adopterName} va a ver tu respuesta en sus solicitudes.`,
            },
      )
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos actualizar la solicitud. Recargá la página e intentá nuevamente.',
      })
    } finally {
      setIsSaving(false)
      setActionToConfirm(null)
    }
  }

  if (isLoading) {
    return <p role="status">Cargando solicitud…</p>
  }

  if (!request) {
    return (
      <>
        <PageHeader title="Solicitud no encontrada" />
        <Link to="/refugio/solicitudes">Volver a Solicitudes de adopción</Link>
      </>
    )
  }

  const isPending = request.status === REQUEST_STATUS.PENDING

  return (
    <>
      <PageHeader
        title="Solicitud de adopción"
        subtitle={`${request.adopterName} quiere adoptar a ${request.pet.name}.`}
      />

      <div className={styles.content}>
        <RequestResultBanner request={request} viewer="shelter" />

        <section aria-labelledby="pet-title">
          <h2 id="pet-title" className={styles.sectionTitle}>
            Mascota solicitada
          </h2>
          <RequestCard request={request} subtitle={`Solicitada por ${request.adopterName}`} />
        </section>

        <Card as="section" aria-labelledby="answers-title">
          <h2 id="answers-title" className={styles.sectionTitle}>
            Respuestas del adoptante
          </h2>
          <RequestAnswers answers={request.answers} />
        </Card>

        {/* Pendiente: Volver como link a la izquierda y las decisiones a la derecha
            (como la solicitud de registro del admin). Resuelta: solo Volver. */}
        {isPending ? (
          <div className={styles.actionsSplit}>
            <ButtonLink to="/refugio/solicitudes" variant="back">
              <span aria-hidden="true">←</span> Volver
            </ButtonLink>
            <div className={styles.mainActions}>
              <Button variant="secondary" onClick={() => setActionToConfirm('reject')} disabled={isSaving}>
                Rechazar
              </Button>
              <Button onClick={() => setActionToConfirm('accept')} disabled={isSaving}>
                Aceptar
              </Button>
            </div>
          </div>
        ) : (
          <div className={styles.actions}>
            <ButtonLink to="/refugio/solicitudes" variant="secondary">
              Volver
            </ButtonLink>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={actionToConfirm !== null}
        onClose={() => setActionToConfirm(null)}
        onConfirm={handleConfirm}
        title={
          actionToConfirm === 'accept'
            ? `¿Aceptar la solicitud de ${request.adopterName}?`
            : `¿Rechazar la solicitud de ${request.adopterName}?`
        }
        message={
          actionToConfirm === 'accept'
            ? `${request.pet.name} va a quedar como adoptada y las demás solicitudes pendientes para ${request.pet.name} se van a rechazar automáticamente. Esta acción no se puede deshacer.`
            : 'El adoptante va a ver que su solicitud fue rechazada. Esta acción no se puede deshacer.'
        }
        confirmLabel={actionToConfirm === 'accept' ? 'Aceptar' : 'Rechazar'}
        cancelLabel="Volver"
        isLoading={isSaving}
      />

      <ResultDialog
        isOpen={dialog !== null}
        onClose={() => setDialog(null)}
        type={dialog?.type}
        title={dialog?.title ?? ''}
        message={dialog?.message}
      />
    </>
  )
}

export default ShelterRequestDetailPage
