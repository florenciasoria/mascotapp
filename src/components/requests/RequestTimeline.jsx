import { formatDate } from '@/utils/dates'
import { adoptedWord } from '@/utils/petOptions'
import { REQUEST_STATUS, REQUEST_STATUS_TONES } from '@/utils/requestOptions'
import styles from './RequestTimeline.module.css'

// Segundo paso de la línea de tiempo: cómo y cuándo se resolvió la solicitud
function getResolution(request) {
  switch (request.status) {
    case REQUEST_STATUS.ACCEPTED:
      return { text: `Aceptada por ${request.shelterName}`, date: request.resolvedAt }
    case REQUEST_STATUS.REJECTED:
      return {
        text: request.autoRejected
          ? `Rechazada automáticamente: ${request.pet.name} fue ${adoptedWord(request.pet.sex)} por otra persona`
          : `Rechazada por ${request.shelterName}`,
        date: request.resolvedAt,
      }
    case REQUEST_STATUS.CANCELLED:
      return { text: 'Cancelada por el adoptante', date: request.resolvedAt }
    default:
      // Pendiente: el paso que falta, sin fecha
      return { text: `Esperando la respuesta de ${request.shelterName}`, date: null }
  }
}

/**
 * Línea de tiempo de una solicitud (RF-17): envío y resolución, con sus fechas.
 * @param {object} props
 * @param {object} props.request - Solicitud.
 */
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
