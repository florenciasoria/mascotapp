import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import LocationMap from '@/components/ui/LocationMap'
import { getPet } from '@/services/petService'
import { formatAge, PET_STATUS } from '@/utils/petOptions'
import styles from './PetDetailPage.module.css'
import { useAuth } from '@/hooks/useAuth'
import { hasActiveRequestForPet } from '@/services/adoptionService'

function PetDetailPage() {
  const { petId } = useParams()
  const { user } = useAuth()
  const [pet, setPet] = useState(null)
  const [alreadyRequested, setAlreadyRequested] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // La mascota y si ya la pidió se buscan a la vez
  useEffect(() => {
    let isActive = true

    Promise.all([getPet(petId), hasActiveRequestForPet(petId, user.uid)])
      .then(([result, requested]) => {
        if (!isActive) return
        setPet(result)
        setAlreadyRequested(requested)
      })
      .catch(() => isActive && setPet(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [petId, user.uid])

  if (isLoading) {
    return <p role="status">Cargando mascota…</p>
  }

  // Si ya no está disponible (adoptada o desactivada), las reglas no dejan leerla
  if (!pet || pet.status !== PET_STATUS.AVAILABLE) {
    return (
      <>
        <h1>Mascota no disponible</h1>
        <p>Esta mascota ya no está disponible para adopción.</p>
        <Link to="/adoptante/buscar">Volver a la búsqueda</Link>
      </>
    )
  }

  // El mapa usa la dirección (no el barrio, que es para filtrar): si el barrio
  // estuviera mal cargado, el mapa igual marca la dirección real.
  const region = pet.neighborhood.startsWith('GBA')
    ? 'Provincia de Buenos Aires'
    : 'Ciudad Autónoma de Buenos Aires'
  const mapAddress = `${pet.shelterAddress ?? pet.neighborhood}, ${region}, Argentina`

  return (
    <Card as="article" className={styles.detail} aria-labelledby="pet-name">
      <div className={styles.top}>
        <div className={styles.imageWrapper}>
          <img
            src={pet.imageUrl}
            alt={`Foto de ${pet.name}, ${pet.species.toLowerCase()} ${pet.color.toLowerCase()}`}
            className={styles.image}
          />
        </div>

        <div className={styles.summary}>
          <h1 id="pet-name" className={styles.name}>
            {pet.name}
          </h1>

          <dl className={styles.facts}>
            <div>
              <dt>Especie</dt>
              <dd>{pet.species}</dd>
            </div>
            <div>
              <dt>Raza</dt>
              <dd>{pet.breed}</dd>
            </div>
            <div>
              <dt>Sexo</dt>
              <dd>{pet.sex}</dd>
            </div>
            <div>
              <dt>Edad</dt>
              <dd>{formatAge(pet.ageValue, pet.ageUnit)}</dd>
            </div>
            <div>
              <dt>Tamaño</dt>
              <dd>{pet.size}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>{pet.color}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section aria-labelledby="about-pet">
        <h2 id="about-pet" className={styles.sectionTitle}>
          Sobre {pet.name}
        </h2>
        <p className={styles.description}>{pet.description}</p>
      </section>

      <section aria-labelledby="shelter-name" className={styles.shelter}>
        <h2 id="shelter-name" className={styles.sectionTitle}>
          {pet.shelterName}
        </h2>
        <p className={styles.address}>
          {pet.shelterAddress ? `${pet.shelterAddress}, ${pet.neighborhood}` : pet.neighborhood}
        </p>
        <LocationMap address={mapAddress} title={`Mapa de la ubicación de ${pet.shelterName}`} />
      </section>

      {alreadyRequested && (
        <p className={styles.requested}>
          <span aria-hidden="true">✓</span>
          Ya enviaste una solicitud para {pet.name}
        </p>
      )}

      <div className={styles.actions}>
        <ButtonLink to="/adoptante/buscar" variant="secondary">
          Volver
        </ButtonLink>
        {/* Si ya la pidió, la acción principal pasa a ser ver sus solicitudes */}
        {alreadyRequested ? (
          <ButtonLink to="/adoptante/solicitudes">Ver mis solicitudes</ButtonLink>
        ) : (
          <ButtonLink to={`/adoptante/mascotas/${pet.id}/solicitar`}>Solicitar adopción</ButtonLink>
        )}
      </div>
    </Card>
  )
}

export default PetDetailPage
