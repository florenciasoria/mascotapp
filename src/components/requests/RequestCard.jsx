import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatAge } from '@/utils/petOptions'
import { formatDate } from '@/utils/dates'
import { REQUEST_STATUS, REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '@/utils/requestOptions'
import styles from './RequestCard.module.css'

// Ícono que acompaña al estado (decorativo: el texto es lo que informa)
const STATUS_ICONS = {
  [REQUEST_STATUS.ACCEPTED]: '✓',
  [REQUEST_STATUS.REJECTED]: '✕',
}

// Tarjeta de solicitud de adopción. La usan el adoptante y el refugio:
// cada pantalla decide qué línea mostrar (subtitle) y qué botones (children).
// Los datos de la mascota son la "foto" guardada al enviar la solicitud.
// highlightPending: borde amarillo en las pendientes (para el refugio, que tiene que revisarlas).
function RequestCard({ request, subtitle, highlightPending = false, children }) {
  const titleId = `request-${request.id}`
  const { pet } = request
  const isCancelled = request.status === REQUEST_STATUS.CANCELLED
  const isHighlighted = highlightPending && request.status === REQUEST_STATUS.PENDING

  const className = [styles.card, isCancelled && styles.muted, isHighlighted && styles.pending]
    .filter(Boolean)
    .join(' ')

  return (
    <Card as="article" className={className} aria-labelledby={titleId}>
      <img
        src={pet.imageUrl}
        alt={`Foto de ${pet.name}, ${pet.species.toLowerCase()}`}
        className={styles.image}
        loading="lazy"
      />
      <div className={styles.info}>
        <h3 id={titleId} className={styles.name}>
          {pet.name}
        </h3>
        <ul className={styles.details}>
          <li>{subtitle}</li>
          <li>
            {pet.species} · {formatAge(pet.ageValue, pet.ageUnit)}
          </li>
          <li>Enviada el {formatDate(request.createdAt)}</li>
        </ul>
        <StatusBadge tone={REQUEST_STATUS_TONES[request.status]} icon={STATUS_ICONS[request.status]}>
          {REQUEST_STATUS_LABELS[request.status]}
        </StatusBadge>
        {request.autoRejected && (
          <p className={styles.reason}>{pet.name} fue adoptada por otra persona.</p>
        )}
      </div>
      {children && <div className={styles.footer}>{children}</div>}
    </Card>
  )
}

export default RequestCard
