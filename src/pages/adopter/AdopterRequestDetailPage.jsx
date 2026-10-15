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
import { cancelAdoptionRequest, getRequest } from '@/services/adoptionService'
import { REQUEST_STATUS } from '@/utils/requestOptions'
import styles from './AdopterRequestDetailPage.module.css'

function AdopterRequestDetailPage() {
  const { requestId } = useParams()
  const [request, setRequest] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [dialog, setDialog] = useState(null)

  // Si la solicitud no existe o es de otro usuario, las reglas no dejan leerla
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

  async function handleConfirmCancel() {
    setIsCancelling(true)
    try {
      await cancelAdoptionRequest(request.id)
      setRequest((current) => ({ ...current, status: REQUEST_STATUS.CANCELLED }))
      setDialog({
        type: 'success',
        title: 'Solicitud cancelada',
        message: `${request.shelterName} ya no va a revisar tu solicitud para ${request.pet.name}.`,
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos cancelar la solicitud. Intentá nuevamente.',
      })
    } finally {
      setIsCancelling(false)
      setIsConfirmOpen(false)
    }
  }

  if (isLoading) {
    return <p role="status">Cargando solicitud…</p>
  }

  if (!request) {
    return (
      <>
        <PageHeader title="Solicitud no encontrada" />
        <Link to="/adoptante/solicitudes">Volver a Mis solicitudes</Link>
      </>
    )
  }

  const isPending = request.status === REQUEST_STATUS.PENDING

  return (
    <>
      <PageHeader
        title="Mi solicitud"
        subtitle={`Tu solicitud para adoptar a ${request.pet.name}.`}
      />

      <div className={styles.content}>
        <section aria-labelledby="pet-title">
          <h2 id="pet-title" className={styles.sectionTitle}>
            Mascota solicitada
          </h2>
          <RequestCard request={request} subtitle={request.shelterName} />
        </section>

        <Card as="section" aria-labelledby="answers-title">
          <h2 id="answers-title" className={styles.sectionTitle}>
            Tus respuestas
          </h2>
          <RequestAnswers answers={request.answers} />
        </Card>

        {/* Volver verde a la izquierda; la acción principal (rosa) a la derecha */}
        <div className={styles.actions}>
          <ButtonLink to="/adoptante/solicitudes" variant="secondary">
            Volver
          </ButtonLink>
          {isPending && <Button onClick={() => setIsConfirmOpen(true)}>Cancelar solicitud</Button>}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmCancel}
        title={`¿Cancelar tu solicitud para adoptar a ${request.pet.name}?`}
        message="El refugio ya no la va a revisar. Si cambiás de opinión, podés volver a solicitarla."
        confirmLabel="Cancelar solicitud"
        cancelLabel="Volver"
        isLoading={isCancelling}
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

export default AdopterRequestDetailPage
