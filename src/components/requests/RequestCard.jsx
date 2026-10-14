import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatAge } from '@/utils/petOptions'
import { formatDate } from '@/utils/dates'
import { REQUEST_STATUS, REQUEST_STATUS_LABELS, REQUEST_STATUS_TONES } from '@/utils/requestOptions'
import styles from './RequestCard.module.css'

// Tarjeta de solicitud de adopción. La usan el adoptante y el refugio:
// cada pantalla decide qué línea mostrar (subtitle) y qué botones (children).
// Los datos de la mascota son la "foto" guardada al enviar la solicitud.
function RequestCard({ request, subtitle, children }) {
  const titleId = `request-${request.id}`
  const { pet } = request
  // Cancelada: la foto se ve en blanco y negro (el texto no se aclara, para no perder contraste)
  const isCancelled = request.status === REQUEST_STATUS.CANCELLED

  return (
    <Card
      as="article"
      className={isCancelled ? `${styles.card} ${styles.muted}` : styles.card}
      aria-labelledby={titleId}
    >
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
        <StatusBadge tone={REQUEST_STATUS_TONES[request.status]}>
          {REQUEST_STATUS_LABELS[request.status]}
        </StatusBadge>
      </div>
      {children && <div className={styles.footer}>{children}</div>}
    </Card>
  )
}

export default RequestCard
