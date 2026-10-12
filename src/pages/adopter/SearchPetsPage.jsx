import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import ButtonLink from '@/components/ui/ButtonLink'
import PetCard from '@/components/pets/PetCard'
import { getAvailablePets } from '@/services/petService'
import styles from './SearchPetsPage.module.css'
import PetFilters from '@/components/pets/PetFilters'
import { EMPTY_FILTERS, filterPets, validateFilters } from '@/utils/petFilters'

function SearchPetsPage() {
  const [pets, setPets] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS)
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS)
  const [filterError, setFilterError] = useState('')

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
  }, []) // aca

    // Mascotas que se muestran: las que cumplen los filtros aplicados
  const visiblePets = filterPets(pets, appliedFilters)

  // Barrios con mascotas disponibles (sin repetir, en orden alfabético)
  const neighborhoods = [...new Set(pets.map((pet) => pet.neighborhood))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  )

  // Aplicar: solo si lo elegido es distinto de lo aplicado
  const canApply = Object.keys(EMPTY_FILTERS).some((key) => draftFilters[key] !== appliedFilters[key])
  // Limpiar: solo si hay algún filtro elegido o aplicado
  const canClear = [draftFilters, appliedFilters].some((filters) =>
    Object.values(filters).some((value) => value !== ''),
  )

  function handleFilterChange(event) {
    const { name, value } = event.target
    setDraftFilters((previous) => ({ ...previous, [name]: value }))
  }

  function handleApply() {
    const error = validateFilters(draftFilters)
    setFilterError(error)
    if (!error) {
      setAppliedFilters(draftFilters)
    }
  }

  function handleClear() {
    setDraftFilters(EMPTY_FILTERS)
    setAppliedFilters(EMPTY_FILTERS)
    setFilterError('')
  }

  return (
    <>
      <PageHeader title="Buscar mascotas" subtitle="Encontrá a tu próximo compañero." />

      <PetFilters
        values={draftFilters}
        neighborhoods={neighborhoods}
        onChange={handleFilterChange}
        onApply={handleApply}
        onClear={handleClear}
        canApply={canApply}
        canClear={canClear}
        error={filterError}
      />
     
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
          {visiblePets.map((pet) => (
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
