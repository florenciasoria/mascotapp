import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import ResultDialog from '@/components/ui/ResultDialog'
import PetForm from '@/components/pets/PetForm'
import { useAuth } from '@/hooks/useAuth'
import { createPet } from '@/services/petService'
import { EMPTY_PET_VALUES } from '@/utils/petOptions'

/** Alta de una mascota del refugio (CU001). */
function RegisterPetPage() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [dialog, setDialog] = useState(null)

  async function handleSubmit(values, imageFile) {
    try {
      await createPet(user.uid, profile, values, imageFile)
      setDialog({
        type: 'success',
        title: '¡Mascota registrada!',
        message: `${values.name.trim()} ya está publicada y disponible para adopción.`,
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos registrar la mascota. Intentá nuevamente.',
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

  // Sin barrio no se puede publicar: la ubicación de la mascota es la del refugio
  if (!profile.neighborhood) {
    return (
      <>
        <PageHeader title="Registrar mascota" />
        <p>
          Para publicar mascotas, primero completá el barrio de tu refugio en{' '}
          <Link to="/refugio/perfil">Mi refugio</Link>.
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Registrar mascota"
        subtitle="Completá la información de la mascota para publicarla."
      />
      <PetForm
        initialValues={EMPTY_PET_VALUES}
        submitLabel="Registrar"
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

export default RegisterPetPage
