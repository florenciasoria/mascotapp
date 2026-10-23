import { formatDate } from '@/utils/dates'
import { REQUEST_STATUS, REQUEST_STATUS_TONES } from '@/utils/requestOptions'
import styles from './RequestTimeline.module.css'

// Qué pasó con la solicitud después de enviarla (el segundo paso de la línea de tiempo)
function getResolution(request) {
  switch (request.status) {
    case REQUEST_STATUS.ACCEPTED:
      return { text: `Aceptada por ${request.shelterName}`, date: request.resolvedAt }
    case REQUEST_STATUS.REJECTED:
      return {
        text: request.autoRejected
          ? `Rechazada automáticamente: ${request.pet.name} fue adoptada por otra persona`
          : `Rechazada por ${request.shelterName}`,
        date: request.resolvedAt,
      }
    case REQUEST_STATUS.CANCELLED:
      return { text: 'Cancelada por el adoptante', date: request.resolvedAt }
    default:
      // Pendiente: todavía no hay respuesta, se muestra como el paso que falta
      return { text: `Esperando la respuesta de ${request.shelterName}`, date: null }
  }
}

// Historial de la solicitud: cuándo se envió y cómo y cuándo se resolvió.
// Se arma con las fechas que ya guarda la solicitud (createdAt y resolvedAt).
function RequestTimeline({ request }) {
  const resolution = getResolution(request)
  const isPending = request.status === REQUEST_STATUS.PENDING

  const steps = [
    {
      text: `Solicitud enviada por ${request.adopterName}`,
      date: request.createdAt,
      tone: 'neutral',
    },
    { ...resolution, tone: REQUEST_STATUS_TONES[request.status], isPending },
  ]

  return (
    <section aria-labelledby="timeline-title">
      <h2 id="timeline-title" className={styles.title}>
        Historial de la solicitud
      </h2>
      <ol className={styles.timeline}>
        {steps.map((step) => (
          <li key={step.text} className={styles.step}>
            <span
              aria-hidden="true"
              className={`${styles.dot} ${styles[step.tone]} ${step.isPending ? styles.pending : ''}`}
            />
            <span className={styles.text}>{step.text}</span>
            {step.date && <span className={styles.date}>{formatDate(step.date)}</span>}
          </li>
        ))}
      </ol>
    </section>
  )
}

export default RequestTimeline
