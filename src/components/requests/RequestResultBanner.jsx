import { formatDate } from '@/utils/dates'
import { REQUEST_STATUS, REQUEST_STATUS_TONES } from '@/utils/requestOptions'
import styles from './RequestResultBanner.module.css'

// Título y texto del cartel según el estado y quién lo mira
function getContent(request, viewer) {
  const date = formatDate(request.resolvedAt)
  const petName = request.pet.name
  const isShelter = viewer === 'shelter'

  switch (request.status) {
    case REQUEST_STATUS.ACCEPTED:
      return {
        icon: '✓',
        title: isShelter ? 'Solicitud aceptada' : '¡Tu solicitud fue aceptada!',
        text: isShelter
          ? `Aceptaste esta solicitud el ${date}. ${petName} ya figura como adoptada.`
          : `${request.shelterName} aceptó tu solicitud para adoptar a ${petName} el ${date}. El refugio se va a comunicar con vos.`,
      }
    case REQUEST_STATUS.REJECTED:
      if (request.autoRejected) {
        return {
          icon: '✕',
          title: 'Solicitud rechazada',
          text: isShelter
            ? `Se rechazó automáticamente el ${date} porque ${petName} fue adoptada por otra persona.`
            : `${petName} fue adoptada por otra persona, por eso tu solicitud se rechazó el ${date}.`,
        }
      }
      return {
        icon: '✕',
        title: 'Solicitud rechazada',
        text: isShelter
          ? `Rechazaste esta solicitud el ${date}.`
          : `${request.shelterName} rechazó tu solicitud el ${date}.`,
      }
    case REQUEST_STATUS.CANCELLED:
      return {
        title: 'Solicitud cancelada',
        text: isShelter
          ? `${request.adopterName} canceló esta solicitud el ${date}.`
          : `Cancelaste esta solicitud el ${date}.`,
      }
    default:
      return null // pendiente: todavía no hay resultado
  }
}

/**
 * Cartel con el resultado de una solicitud resuelta. No muestra nada si está pendiente.
 * @param {object} props
 * @param {object} props.request - Solicitud.
 * @param {'shelter'|'adopter'} props.viewer - Quién la mira (cambia la redacción).
 */
function RequestResultBanner({ request, viewer }) {
  const content = getContent(request, viewer)
  if (!content) return null

  return (
    <div className={`${styles.banner} ${styles[REQUEST_STATUS_TONES[request.status]]}`}>
      <p className={styles.title}>
        {content.icon && <span aria-hidden="true">{content.icon}</span>}
        {content.title}
      </p>
      <p className={styles.text}>{content.text}</p>
    </div>
  )
}

export default RequestResultBanner
