import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResultDialog from '@/components/ui/ResultDialog'
import UserCard from '@/components/users/UserCard'
import { useAuth } from '@/hooks/useAuth'
import { deactivateAccount, getAllUsers, updateUserStatus } from '@/services/userService'
import { ROLE_LABELS, ROLES, STATUS } from '@/utils/roles'
import {
  EMPTY_USER_FILTERS,
  filterUsers,
  getStatusOptions,
  sortPendingFirst,
} from '@/utils/userFilters'
import styles from './AdminUsersPage.module.css'

// Opciones de los filtros a partir de los textos de roles
const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }))
const ROLE_OPTIONS = [{ value: '', label: 'Todos' }, ...toOptions(ROLE_LABELS)]

// Confirmación y resultado de cada cambio de estado (mismos textos que el detalle de la cuenta)
const STATUS_CHANGES = {
  [STATUS.INACTIVE]: {
    label: 'Desactivar',
    title: (name) => `¿Desactivar a ${name}?`,
    message:
      'Mientras esté desactivada, la cuenta no va a poder usar MascotApp. Podés reactivarla cuando quieras.',
    successTitle: 'Cuenta desactivada',
    successMessage: 'La cuenta ya no puede usar MascotApp.',
  },
  [STATUS.APPROVED]: {
    label: 'Reactivar',
    title: (name) => `¿Reactivar a ${name}?`,
    message:
      'La cuenta va a poder volver a usar MascotApp. Si es un refugio, sus mascotas siguen pausadas hasta que las vuelva a publicar.',
    successTitle: '¡Cuenta reactivada!',
    successMessage: 'La cuenta puede volver a usar MascotApp.',
  },
}

/** Gestión de usuarios (CU007): listado con filtros, aviso de pendientes y cambio de estado. */
function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [draftFilters, setDraftFilters] = useState(EMPTY_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_USER_FILTERS)
  const [updatingId, setUpdatingId] = useState(null)
  const [statusChange, setStatusChange] = useState(null) // { account, newStatus }
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let isActive = true

    getAllUsers()
      // El administrador no se lista a sí mismo
      .then((result) => isActive && setUsers(result.filter((item) => item.id !== user.uid)))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  const visibleUsers = sortPendingFirst(filterUsers(users, appliedFilters))
  const pendingCount = users.filter((item) => item.status === STATUS.PENDING).length
  const isReady = !isLoading && !loadError

  const canApply = Object.keys(EMPTY_USER_FILTERS).some(
    (key) => draftFilters[key] !== appliedFilters[key],
  )
  const canClear = [draftFilters, appliedFilters].some((filters) =>
    Object.values(filters).some((value) => value !== ''),
  )

  function handleFilterChange(event) {
    const { name, value } = event.target
    setDraftFilters((previous) => {
      const next = { ...previous, [name]: value }
      // Si el estado elegido no aplica al rol nuevo, vuelve a "Todos"
      if (
        name === 'role' &&
        !getStatusOptions(value).some((option) => option.value === next.status)
      ) {
        next.status = ''
      }
      return next
    })
  }

  function handleApply(event) {
    event.preventDefault()
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_USER_FILTERS)
    setAppliedFilters(EMPTY_USER_FILTERS)
  }

  function handleShowPending() {
    const pendingFilters = { ...EMPTY_USER_FILTERS, role: ROLES.SHELTER, status: STATUS.PENDING }
    setDraftFilters(pendingFilters)
    setAppliedFilters(pendingFilters)
  }

  async function changeStatus(account, newStatus) {
    setUpdatingId(account.id)
    try {
      if (newStatus === STATUS.INACTIVE) {
        await deactivateAccount(account)
      } else {
        await updateUserStatus(account.id, newStatus)
      }

      setUsers((current) =>
        current.map((item) => (item.id === account.id ? { ...item, status: newStatus } : item)),
      )
      const { successTitle, successMessage } = STATUS_CHANGES[newStatus]
      setDialog({ type: 'success', title: successTitle, message: successMessage })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: `No pudimos actualizar el estado de ${account.name}. Intentá nuevamente.`,
      })
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleConfirmStatusChange() {
    await changeStatus(statusChange.account, statusChange.newStatus)
    setStatusChange(null)
  }

  const pendingChange = statusChange && STATUS_CHANGES[statusChange.newStatus]

  return (
    <>
      <PageHeader
        title="Gestionar usuarios"
        subtitle="Consultá y administrá los usuarios registrados en la plataforma."
      />

      {pendingCount > 0 && (
        <div className={styles.pendingAlert}>
          <p className={styles.pendingText}>
            {pendingCount === 1
              ? 'Tenés 1 refugio esperando aprobación.'
              : `Tenés ${pendingCount} refugios esperando aprobación.`}
          </p>
          <Button size="sm" onClick={handleShowPending}>
            Ver pendientes
          </Button>
        </div>
      )}

      <Card
        as="form"
        role="search"
        aria-label="Filtros de usuarios"
        className={styles.filters}
        onSubmit={handleApply}
        noValidate
      >
        <div className={styles.filterGrid}>
          <Input
            label="Buscar usuario"
            type="search"
            name="search"
            value={draftFilters.search}
            onChange={handleFilterChange}
            hint="Por nombre o email"
          />
          <Select
            label="Rol"
            name="role"
            value={draftFilters.role}
            onChange={handleFilterChange}
            options={ROLE_OPTIONS}
          />
          <Select
            label="Estado"
            name="status"
            value={draftFilters.status}
            onChange={handleFilterChange}
            options={getStatusOptions(draftFilters.role)}
          />
        </div>
        <div className={styles.filterActions}>
          <Button variant="secondary" onClick={handleClear} disabled={!canClear}>
            Limpiar filtros
          </Button>
          <Button type="submit" disabled={!canApply}>
            Aplicar
          </Button>
        </div>
      </Card>

      <section aria-labelledby="users-title">
        <h2 id="users-title" className={styles.sectionTitle}>
          Usuarios registrados
        </h2>

        {isLoading && <p role="status">Cargando usuarios…</p>}

        {loadError && (
          <p className={styles.error} role="alert">
            No pudimos cargar los usuarios. Recargá la página para intentar de nuevo.
          </p>
        )}

        {isReady && (
          <p className={styles.count} role="status">
            {visibleUsers.length === 1
              ? '1 usuario encontrado'
              : `${visibleUsers.length} usuarios encontrados`}
          </p>
        )}

        {isReady && visibleUsers.length === 0 && (
          <p className={styles.empty}>
            No encontramos usuarios que coincidan con los filtros elegidos.
          </p>
        )}

        {visibleUsers.length > 0 && (
          <ul className={styles.grid}>
            {visibleUsers.map((item) => (
              <li key={item.id}>
                <UserCard
                  user={item}
                  onDeactivate={(account) =>
                    setStatusChange({ account, newStatus: STATUS.INACTIVE })
                  }
                  onReactivate={(account) =>
                    setStatusChange({ account, newStatus: STATUS.APPROVED })
                  }
                  isUpdating={updatingId === item.id}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        isOpen={statusChange !== null}
        onClose={() => setStatusChange(null)}
        onConfirm={handleConfirmStatusChange}
        title={pendingChange?.title(statusChange.account.name) ?? ''}
        message={pendingChange?.message}
        confirmLabel={pendingChange?.label}
        isLoading={statusChange !== null && updatingId === statusChange.account.id}
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

export default AdminUsersPage
