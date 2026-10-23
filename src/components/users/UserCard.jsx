import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import StatusBadge from '@/components/ui/StatusBadge'
import { ROLE_LABELS, STATUS, STATUS_LABELS, STATUS_TONES } from '@/utils/roles'
import styles from './UserCard.module.css'

/**
 * Tarjeta de un usuario en Gestionar usuarios.
 * Resalta los pendientes y atenúa los desactivados.
 * @param {object} props
 * @param {object} props.user - Usuario.
 * @param {(user: object) => void} props.onDeactivate - Pide desactivar la cuenta.
 * @param {(user: object) => void} props.onReactivate - Reactiva la cuenta.
 * @param {boolean} [props.isUpdating] - Hay un cambio de estado en curso.
 */
function UserCard({ user, onDeactivate, onReactivate, isUpdating = false }) {
  const titleId = `user-${user.id}`
  const isPending = user.status === STATUS.PENDING
  const isActive = user.status === STATUS.APPROVED
  const isInactive = user.status === STATUS.INACTIVE

  const className = [styles.card, isPending && styles.pending, isInactive && styles.inactive]
    .filter(Boolean)
    .join(' ')

  return (
    <Card as="article" className={className} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.name}>
        {user.name}
      </h3>
      <p className={styles.text}>{user.email}</p>
      {!user.emailVerified && <p className={styles.unverified}>Email sin verificar</p>}
      <p className={styles.text}>{ROLE_LABELS[user.role]}</p>
      <StatusBadge tone={STATUS_TONES[user.status]}>{STATUS_LABELS[user.status]}</StatusBadge>

      <div className={styles.actions}>
        {isActive && (
          <Button
            variant="secondary"
            onClick={() => onDeactivate(user)}
            disabled={isUpdating}
            aria-label={`Desactivar a ${user.name}`}
            size="sm"
          >
            Desactivar
          </Button>
        )}
        {isInactive && (
          <Button
            variant="secondary"
            onClick={() => onReactivate(user)}
            isLoading={isUpdating}
            disabled={!user.emailVerified}
            title={
              user.emailVerified ? undefined : 'No se puede reactivar: el email no está verificado'
            }
            aria-label={`Reactivar a ${user.name}`}
            size="sm"
          >
            Reactivar
          </Button>
        )}
        <ButtonLink
          to={`/admin/usuarios/${user.id}`}
          aria-label={isPending ? `Ver solicitud de ${user.name}` : `Ver a ${user.name}`}
          size="sm"
        >
          {isPending ? 'Ver solicitud' : 'Ver'}
        </ButtonLink>
      </div>
    </Card>
  )
}

export default UserCard
