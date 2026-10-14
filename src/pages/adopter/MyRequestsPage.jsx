import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import RequestCard from '@/components/requests/RequestCard'
import { useAuth } from '@/hooks/useAuth'
import { getAdopterRequests } from '@/services/adoptionService'
import styles from './MyRequestsPage.module.css'

function MyRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Carga las solicitudes del adoptante al entrar a la pantalla
  useEffect(() => {
    let isActive = true

    getAdopterRequests(user.uid)
      .then((result) => isActive && setRequests(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  return (
    <>
      <PageHeader
        title="Mis solicitudes"
        subtitle="Seguí el estado de las solicitudes de adopción que enviaste."
      />

      {isLoading && <p role="status">Cargando solicitudes…</p>}

      {loadError && (
        <p className={styles.error} role="alert">
          No pudimos cargar tus solicitudes. Recargá la página para intentar de nuevo.
        </p>
      )}

      {!isLoading && !loadError && requests.length === 0 && (
        <p>
          Todavía no enviaste solicitudes.{' '}
          <Link to="/adoptante/buscar">Buscá una mascota para adoptar</Link>.
        </p>
      )}

      {requests.length > 0 && (
        <ul className={styles.grid}>
          {requests.map((request) => (
            <li key={request.id}>
              <RequestCard request={request} subtitle={request.shelterName} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default MyRequestsPage

