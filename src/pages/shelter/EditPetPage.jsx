import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import ResultDialog from '@/components/ui/ResultDialog'
import PetForm from '@/components/pets/PetForm'
import { useAuth } from '@/hooks/useAuth'
import { getPet, updatePet } from '@/services/petService'
import { PET_STATUS } from '@/utils/petOptions'

// Convierte una mascota guardada en valores del formulario
function toFormValues(pet) {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    ageValue: String(pet.ageValue),
    ageUnit: pet.ageUnit,
    size: pet.size,
    color: pet.color,
    description: pet.description,
  }
}

/** Edición de una mascota del refugio (CU001). */
function EditPetPage() {
  const { petId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let isActive = true // evita actualizar el estado si la pantalla ya se cerró

    getPet(petId)
      .then((result) => isActive && setPet(result))
      .catch(() => isActive && setPet(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [petId])

  async function handleSubmit(values, imageFile) {
    try {
      await updatePet(pet, values, imageFile)
      setDialog({
        type: 'success',
        title: '¡Cambios guardados!',
        message: `Los datos de ${values.name.trim()} se actualizaron correctamente.`,
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos guardar los cambios. Intentá nuevamente.',
      })
    }
  }

  function handleDialogClose() {
    const wasSuccess = dialog?.type === 'success'
    setDialog(null)
    if (wasSuccess) {
      navigate('/refugio/mascotas')
    }
  }

  if (isLoading) {
    return <p role="status">Cargando mascota…</p>
  }

  // Solo se editan mascotas propias que no fueron adoptadas
  const canEdit = pet && pet.shelterId === user.uid && pet.status !== PET_STATUS.ADOPTED

  if (!canEdit) {
    return (
      <>
        <PageHeader title="Editar mascota" />
        <p>No encontramos esta mascota o ya no se puede editar.</p>
        <Link to="/refugio/mascotas">Volver a Mis mascotas</Link>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Editar mascota" subtitle="Actualizá la información de la mascota." />
      <PetForm
        initialValues={toFormValues(pet)}
        currentImageUrl={pet.imageUrl}
        submitLabel="Guardar"
        isEditing
        onSubmit={handleSubmit}
        onCancel={() => navigate('/refugio/mascotas')}
      />
      <ResultDialog
        isOpen={dialog !== null}
        onClose={handleDialogClose}
        type={dialog?.type}
        title={dialog?.title ?? ''}
        message={dialog?.message}
      />
    </>
  )
}

export default EditPetPage
