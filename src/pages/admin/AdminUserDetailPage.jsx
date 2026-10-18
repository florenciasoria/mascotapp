import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import StatusBadge from '@/components/ui/StatusBadge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResultDialog from '@/components/ui/ResultDialog'
import { useAuth } from '@/hooks/useAuth'
import { deactivateAccount, getUser, updateUserStatus } from '@/services/userService'
import { formatDate } from '@/utils/dates'
import { ROLE_LABELS, ROLES, STATUS, STATUS_LABELS, STATUS_TONES } from '@/utils/roles'
import styles from './AdminUserDetailPage.module.css'

// Acciones que puede hacer el admin. "confirm" = pide confirmación antes.
const ACTIONS = {
  approve: {
    label: 'Aprobar refugio',
    newStatus: STATUS.APPROVED,
    successTitle: '¡Refugio aprobado!',
    successMessage: 'Ya puede publicar mascotas y usar MascotApp.',
  },
  reject: {
    label: 'Rechazar refugio',
    newStatus: STATUS.REJECTED,
    variant: 'secondary',
    confirm: {
      title: '¿Rechazar este refugio?',
      message:
        'El refugio no va a poder usar MascotApp. Si cambiás de opinión, más adelante podés aprobarlo.',
    },
    successTitle: 'Refugio rechazado',
    successMessage: 'El refugio no va a poder usar MascotApp.',
  },
  deactivate: {
    label: 'Desactivar cuenta',
    newStatus: STATUS.INACTIVE,
    confirm: {
      title: '¿Desactivar esta cuenta?',
      message:
        'Mientras esté desactivada, no va a poder usar MascotApp. Si es un refugio, sus mascotas publicadas dejan de mostrarse. Podés reactivarla cuando quieras.',
    },
    successTitle: 'Cuenta desactivada',
    successMessage: 'La cuenta ya no puede usar MascotApp.',
  },
  reactivate: {
    label: 'Reactivar cuenta',
    newStatus: STATUS.APPROVED,
    successTitle: '¡Cuenta reactivada!',
    successMessage: 'La cuenta puede volver a usar MascotApp.',
  },
}

// Qué acciones corresponden a cada estado
const ACTIONS_BY_STATUS = {
  [STATUS.PENDING]: ['reject', 'approve'],
  [STATUS.APPROVED]: ['deactivate'],
  [STATUS.INACTIVE]: ['reactivate'],
  [STATUS.REJECTED]: ['approve'],
}

function AdminUserDetailPage() {
  const { userId } = useParams()
  const { user } = useAuth()
  const [account, setAccount] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [actionToConfirm, setActionToConfirm] = useState(null)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let isActive = true

    getUser(userId)
      .then((result) => isActive && setAccount(result))
      .catch(() => isActive && setAccount(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [userId])

  async function runAction(actionKey) {
    const action = ACTIONS[actionKey]
    setIsSaving(true)
    try {
      if (action.newStatus === STATUS.INACTIVE) {
        await deactivateAccount(account)
      } else {
        await updateUserStatus(account.id, action.newStatus)
      }
      setAccount((current) => ({ ...current, status: action.newStatus }))
      setDialog({ type: 'success', title: action.successTitle, message: action.successMessage })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos actualizar el estado. Intentá nuevamente.',
      })
    } finally {
      setIsSaving(false)
      setActionToConfirm(null)
    }
  }

  function handleActionClick(actionKey) {
    if (ACTIONS[actionKey].confirm) {
      setActionToConfirm(actionKey)
    } else {
      runAction(actionKey)
    }
  }

  if (isLoading) {
    return <p role="status">Cargando usuario…</p>
  }

  // El admin no se gestiona a sí mismo
  if (!account || account.id === user.uid) {
    return (
      <>
        <PageHeader title="Usuario no encontrado" />
        <Link to="/admin/usuarios">Volver a Gestionar usuarios</Link>
      </>
    )
  }

  const isShelter = account.role === ROLES.SHELTER
  const isPending = account.status === STATUS.PENDING
  const actions = ACTIONS_BY_STATUS[account.status] ?? []
  const confirmAction = actionToConfirm ? ACTIONS[actionToConfirm] : null

  // No se puede aprobar ni reactivar (pasar a "aprobado") una cuenta sin el email verificado
  const isBlockedAction = (key) =>
    ACTIONS[key].newStatus === STATUS.APPROVED && !account.emailVerified
  const isApproveBlocked = actions.some(isBlockedAction)

  return (
    <>
      <PageHeader
        title={isPending ? 'Solicitud de registro' : 'Información del usuario'}
        subtitle={
          isPending
            ? 'Revisá la información del refugio antes de aprobar su registro.'
            : 'Consultá la información de la cuenta.'
        }
      />

      <Card className={styles.card}>
        <dl className={styles.facts}>
          <div>
            <dt>{isShelter ? 'Nombre del refugio' : 'Nombre y apellido'}</dt>
            <dd>{account.name}</dd>
          </div>
          <div>
            <dt>Correo electrónico</dt>
            <dd>
              {account.email}
              {!account.emailVerified && (
                <span className={styles.unverified}>Email sin verificar</span>
              )}
            </dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{account.phone}</dd>
          </div>
          <div>
            <dt>Dirección</dt>
            <dd>{account.address}</dd>
          </div>
          {isShelter && (
            <div>
              <dt>Barrio</dt>
              <dd>{account.neighborhood ?? '—'}</dd>
            </div>
          )}
          <div>
            <dt>Rol</dt>
            <dd>{ROLE_LABELS[account.role]}</dd>
          </div>
          <div>
            <dt>Estado</dt>
            <dd>
              <StatusBadge tone={STATUS_TONES[account.status]}>
                {STATUS_LABELS[account.status]}
              </StatusBadge>
            </dd>
          </div>
          <div>
            <dt>Fecha de alta</dt>
            <dd>{formatDate(account.createdAt)}</dd>
          </div>
          {isShelter && (
            <div className={styles.fullWidth}>
              <dt>Sobre el refugio</dt>
              <dd>{account.about}</dd>
            </div>
          )}
        </dl>
      </Card>

      {/* En la solicitud (dos decisiones), Volver es un link aparte a la izquierda.
          En los demás casos, botón verde como en el resto de la app. */}
      {isApproveBlocked && (
        <p id="approve-blocked-note" className={styles.note}>
          Esta cuenta todavía no verificó su email, por eso no se puede aprobar ni reactivar.
        </p>
      )}

      <div className={isPending ? styles.actionsSplit : styles.actions}>
        {isPending ? (
          <ButtonLink to="/admin/usuarios" variant="back">
            <span aria-hidden="true">←</span> Volver
          </ButtonLink>
        ) : (
          <ButtonLink to="/admin/usuarios" variant="secondary">
            Volver
          </ButtonLink>
        )}
        <div className={styles.mainActions}>
          {actions.map((key) => (
            <Button
              key={key}
              variant={ACTIONS[key].variant ?? 'primary'}
              onClick={() => handleActionClick(key)}
              disabled={isSaving || isBlockedAction(key)}
              aria-describedby={isBlockedAction(key) ? 'approve-blocked-note' : undefined}
            >
              {ACTIONS[key].label}
            </Button>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setActionToConfirm(null)}
        onConfirm={() => runAction(actionToConfirm)}
        title={confirmAction?.confirm.title ?? ''}
        message={confirmAction?.confirm.message}
        confirmLabel={confirmAction?.label}
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

export default AdminUserDetailPage
