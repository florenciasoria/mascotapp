import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import ButtonLink from '@/components/ui/ButtonLink'
import PetCard from '@/components/pets/PetCard'
import { getAvailablePets } from '@/services/petService'
import styles from './SearchPetsPage.module.css'

function SearchPetsPage() {
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)

  // Trae todas las mascotas disponibles una sola vez (los filtros se aplican después)
  useEffect(() => {
    let isActive = true

    getAvailablePets()
      .then((result) => isActive && setPets(result))
      .catch(() => isActive && setLoadError(true))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [])

  return (
    <>
      <PageHeader title="Buscar mascotas" subtitle="Encontrá a tu próximo compañero." />

      <section aria-labelledby="available-pets-title">
        <h2 id="available-pets-title" className={styles.sectionTitle}>
          Mascotas disponibles
        </h2>

        {isLoading && <p role="status">Cargando mascotas…</p>}

        {loadError && (
          <p className={styles.error} role="alert">
            No pudimos cargar las mascotas. Recargá la página para intentar de nuevo.
          </p>
        )}

        <ul className={styles.grid}>
          {pets.map((pet) => (
            <li key={pet.id}>
              <PetCard pet={pet}>
                <ButtonLink
                  to={`/adoptante/mascotas/${pet.id}`}
                  variant="secondary"
                  aria-label={`Ver más sobre ${pet.name}`}
                >
                  Ver más
                </ButtonLink>
              </PetCard>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

export default SearchPetsPage
