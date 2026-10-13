import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import UserCard from '@/components/users/UserCard'
import { useAuth } from '@/hooks/useAuth'
import { EMPTY_USER_FILTERS, filterUsers } from '@/utils/userFilters'
import styles from './AdminUsersPage.module.css'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import ResultDialog from '@/components/ui/ResultDialog'
import { getAllUsers, updateUserStatus } from '@/services/userService'
import { ROLE_LABELS, STATUS, STATUS_LABELS } from '@/utils/roles'


// Opciones de los filtros, armadas a partir de los textos de roles y estados
const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }))
const ROLE_OPTIONS = [{ value: '', label: 'Todos' }, ...toOptions(ROLE_LABELS)]
const STATUS_OPTIONS = [{ value: '', label: 'Todos' }, ...toOptions(STATUS_LABELS)]

function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [draftFilters, setDraftFilters] = useState(EMPTY_USER_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_USER_FILTERS)
  const [updatingId, setUpdatingId] = useState(null)
  const [userToDeactivate, setUserToDeactivate] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isActive = true

    getAllUsers()
      // El admin no se gestiona a sí mismo
      .then((result) => isActive && setUsers(result.filter((item) => item.id !== user.uid)))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  const visibleUsers = filterUsers(users, appliedFilters)
  const isReady = !isLoading && !loadError

  const canApply = Object.keys(EMPTY_USER_FILTERS).some(
    (key) => draftFilters[key] !== appliedFilters[key],
  )
  const canClear = [draftFilters, appliedFilters].some((filters) =>
    Object.values(filters).some((value) => value !== ''),
  )

  function handleFilterChange(event) {
    const { name, value } = event.target
    setDraftFilters((previous) => ({ ...previous, [name]: value }))
  }

  function handleApply(event) {
    event.preventDefault()
    setAppliedFilters(draftFilters)
  }

  function handleClear() {
    setDraftFilters(EMPTY_USER_FILTERS)
    setAppliedFilters(EMPTY_USER_FILTERS)
  }

    async function changeStatus(account, newStatus) {
    setUpdatingId(account.id)
    try {
      await updateUserStatus(account.id, newStatus)
      setUsers((current) =>
        current.map((item) => (item.id === account.id ? { ...item, status: newStatus } : item)),
      )
    } catch {
      setErrorMessage(`No pudimos actualizar el estado de ${account.name}. Intentá nuevamente.`)
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleConfirmDeactivate() {
    await changeStatus(userToDeactivate, STATUS.INACTIVE)
    setUserToDeactivate(null)
  }

  return (
    <>
      <PageHeader
        title="Gestionar usuarios"
        subtitle="Consultá y administrá los usuarios registrados en la plataforma."
      />

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
          <Select label="Rol" name="role" value={draftFilters.role} onChange={handleFilterChange} options={ROLE_OPTIONS} />
          <Select label="Estado" name="status" value={draftFilters.status} onChange={handleFilterChange} options={STATUS_OPTIONS} />
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
          <p className={styles.empty}>No encontramos usuarios que coincidan con los filtros elegidos.</p>
        )}

        <ul className={styles.grid}>
          {visibleUsers.map((item) => (
            <li key={item.id}>
                <UserCard
                    user={item}
                    onDeactivate={setUserToDeactivate}
                    onReactivate={(account) => changeStatus(account, STATUS.APPROVED)}
                    isUpdating={updatingId === item.id}
                />
            </li>
          ))}
        </ul>
      </section>

      <ConfirmDialog
        isOpen={userToDeactivate !== null}
        onClose={() => setUserToDeactivate(null)}
        onConfirm={handleConfirmDeactivate}
        title={`¿Desactivar a ${userToDeactivate?.name ?? ''}?`}
        message="Mientras esté desactivada, la cuenta no va a poder usar MascotApp. Podés reactivarla cuando quieras."
        confirmLabel="Desactivar"
        isLoading={userToDeactivate !== null && updatingId === userToDeactivate.id}
      />

      <ResultDialog
        isOpen={errorMessage !== ''}
        onClose={() => setErrorMessage('')}
        type="error"
        title="¡Error!"
        message={errorMessage}
      />
    </>
  )
}

export default AdminUsersPage
