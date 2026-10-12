import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import StatusBadge from '@/components/ui/StatusBadge'
import ResultDialog from '@/components/ui/ResultDialog'
import PetCard from '@/components/pets/PetCard'
import { useAuth } from '@/hooks/useAuth'
import { getShelterPets, setPetStatus } from '@/services/petService'
import { PET_STATUS, PET_STATUS_LABELS } from '@/utils/petOptions'
import styles from './ShelterPetsPage.module.css'

const STATUS_TONES = {
  [PET_STATUS.AVAILABLE]: 'success',
  [PET_STATUS.UNAVAILABLE]: 'danger',
  [PET_STATUS.ADOPTED]: 'neutral',
}

function ShelterPetsPage() {
  const { user } = useAuth()
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  // Carga las mascotas del refugio al entrar a la pantalla
  useEffect(() => {
    let isActive = true // evita actualizar el estado si la pantalla ya se cerró

    getShelterPets(user.uid)
      .then((result) => isActive && setPets(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [user.uid])

  async function handleToggleStatus(pet) {
    const newStatus =
      pet.status === PET_STATUS.AVAILABLE ? PET_STATUS.UNAVAILABLE : PET_STATUS.AVAILABLE

    setUpdatingId(pet.id)
    try {
      await setPetStatus(pet.id, newStatus)
      setPets((current) =>
        current.map((item) => (item.id === pet.id ? { ...item, status: newStatus } : item)),
      )
    } catch {
      setErrorMessage(`No pudimos actualizar el estado de ${pet.name}. Intentá nuevamente.`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <>
      <PageHeader title="Mis mascotas" subtitle="Gestioná las mascotas de tu refugio." />

      <Card as="section" className={styles.registerCard} aria-labelledby="register-pet-title">
        <h2 id="register-pet-title" className={styles.cardTitle}>Registrar una mascota</h2>
        <p className={styles.cardText}>Agregá una nueva mascota para publicar en la plataforma.</p>
        <ButtonLink to="/refugio/mascotas/nueva">Registrar mascota</ButtonLink>
      </Card>

      <section aria-labelledby="registered-pets-title">
        <h2 id="registered-pets-title" className={styles.sectionTitle}>Mascotas registradas</h2>

        {isLoading && <p role="status">Cargando mascotas…</p>}

        {loadError && (
          <p className={styles.error} role="alert">
            No pudimos cargar tus mascotas. Recargá la página para intentar de nuevo.
          </p>
        )}

        {!isLoading && !loadError && pets.length === 0 && (
          <p>Todavía no registraste mascotas.</p>
        )}

        <ul className={styles.grid}>
          {pets.map((pet) => {
            const isAvailable = pet.status === PET_STATUS.AVAILABLE
            const toggleLabel = isAvailable ? 'Desactivar' : 'Activar'

            return (
              <li key={pet.id}>
                <PetCard pet={pet}>
                  <StatusBadge tone={STATUS_TONES[pet.status]}>
                    {PET_STATUS_LABELS[pet.status]}
                  </StatusBadge>

                  {pet.status !== PET_STATUS.ADOPTED && (
                    <div className={styles.actions}>
                      <Button
                        variant="secondary"
                        onClick={() => handleToggleStatus(pet)}
                        isLoading={updatingId === pet.id}
                        aria-label={`${toggleLabel} a ${pet.name}`}
                      >
                        {toggleLabel}
                      </Button>
                      <ButtonLink
                        to={`/refugio/mascotas/${pet.id}/editar`}
                        aria-label={`Editar a ${pet.name}`}
                      >
                        Editar
                      </ButtonLink>
                    </div>
                  )}
                </PetCard>
              </li>
            )
          })}
        </ul>
      </section>

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

export default ShelterPetsPage
