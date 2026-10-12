import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import styles from '@/pages/shared/HomeCards.module.css'

function AdminHomePage() {
  return (
    <>
      <PageHeader
        title={<>¡Hola, Administrador! <span aria-hidden="true">👋</span></>}
        subtitle="Gestioná y supervisá la información de MascotApp."
      />

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
