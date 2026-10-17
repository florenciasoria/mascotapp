import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import styles from '@/pages/shared/HomeCards.module.css'
import { useEffect, useState } from 'react'
import Notice from '@/components/ui/Notice'
import { countPendingShelters } from '@/services/userService'

function AdminHomePage() {
  const [pendingCount, setPendingCount] = useState(0)

  // El aviso es secundario: si falla el conteo, simplemente no se muestra
  useEffect(() => {
    let isActive = true
    countPendingShelters()
      .then((count) => isActive && setPendingCount(count))
      .catch(() => {})
    return () => {
      isActive = false
    }
  }, [])

  return (
    <>
      <PageHeader
        title={<>¡Hola, Administrador! <span aria-hidden="true">👋</span></>}
        subtitle="Gestioná y supervisá la información de MascotApp."
      />

      {pendingCount > 0 && (
        <Notice to="/admin/usuarios" actionLabel="Ver usuarios">
          {pendingCount === 1
            ? 'Tenés 1 refugio esperando aprobación.'
            : `Tenés ${pendingCount} refugios esperando aprobación.`}
        </Notice>
      )}

      <div className={styles.cards}>
        <Card as="section" aria-labelledby="manage-users-title">
          <h2 id="manage-users-title" className={styles.cardTitle}>Gestionar usuarios</h2>
          <p className={styles.cardText}>Consultá y administrá los usuarios registrados en la plataforma.</p>
          <div className={styles.cardAction}>
            <ButtonLink to="/admin/usuarios">Gestionar usuarios</ButtonLink>
          </div>
        </Card>

        <Card as="section" aria-labelledby="supervise-title">
          <h2 id="supervise-title" className={styles.cardTitle}>Supervisar MascotApp</h2>
          <p className={styles.cardText}>Consultá la información general y actividad de la plataforma.</p>
          <div className={styles.cardAction}>
            <ButtonLink to="/admin/supervision" variant="secondary">
              Ver supervisión
            </ButtonLink>
          </div>
        </Card>
      </div>
    </>
  )
}

export default AdminHomePage
