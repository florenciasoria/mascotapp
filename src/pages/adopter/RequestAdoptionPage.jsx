import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import ToggleGroup from '@/components/ui/ToggleGroup'
import Button from '@/components/ui/Button'
import ResultDialog from '@/components/ui/ResultDialog'
import { useAuth } from '@/hooks/useAuth'
import { getPet } from '@/services/petService'
import { createAdoptionRequest, hasActiveRequestForPet } from '@/services/adoptionService'
import { PET_STATUS } from '@/utils/petOptions'
import { EXPERIENCE_RANGES, HOURS_ALONE, HOUSING_TYPES } from '@/utils/requestOptions'
import { LIMITS, validateRequestForm } from '@/utils/validators'
import { focusFirstInvalidField } from '@/utils/forms'
import styles from './RequestAdoptionPage.module.css'

// Sí/No sin valor inicial: el adoptante tiene que elegir cada respuesta
const EMPTY_REQUEST_VALUES = {
  housingType: '',
  hoursAlone: '',
  householdMembers: '',
  hasYard: '',
  hasSafetyNet: '',
  hasOtherPets: '',
  otherPetsDetail: '',
  hasExperience: '',
  experienceYears: '',
  aboutAdopter: '',
  motivation: '',
}

// Pregunta de seguimiento de cada Sí/No (solo aparece si respondió "Sí")
const FOLLOW_UPS = {
  hasYard: 'hasSafetyNet',
  hasOtherPets: 'otherPetsDetail',
  hasExperience: 'experienceYears',
}

function RequestAdoptionPage() {
  const { petId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [alreadyRequested, setAlreadyRequested] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState(EMPTY_REQUEST_VALUES)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialog, setDialog] = useState(null)

  // La mascota y si ya la pidió se buscan a la vez
  useEffect(() => {
    let isActive = true

    Promise.all([getPet(petId), hasActiveRequestForPet(petId, user.uid)])
      .then(([petResult, requested]) => {
        if (!isActive) return
        setPet(petResult)
        setAlreadyRequested(requested)
      })
      .catch(() => isActive && setPet(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [petId, user.uid])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => {
      const next = { ...previous, [name]: value }
      // Si pasa a "No", se borra lo que había respondido en la pregunta de seguimiento
      if (FOLLOW_UPS[name] && value === 'no') {
        next[FOLLOW_UPS[name]] = ''
      }
      return next
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateRequestForm(values)
    setErrors(validationErrors)
    if (focusFirstInvalidField(event.currentTarget, validationErrors)) {
      return
    }

    setIsSubmitting(true)
    try {
      await createAdoptionRequest(pet, { uid: user.uid, name: profile.name }, values)
      setDialog({
        type: 'success',
        title: '¡Solicitud enviada!',
        message: `${pet.shelterName} va a revisar tu solicitud para adoptar a ${pet.name}.`,
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos enviar la solicitud. Intentá nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Al cerrar el diálogo de éxito, vamos a Mis solicitudes
  function handleDialogClose() {
    const wasSuccess = dialog?.type === 'success'
    setDialog(null)
    if (wasSuccess) {
      navigate('/adoptante/solicitudes')
    }
  }

  if (isLoading) {
    return <p role="status">Cargando…</p>
  }

  if (!pet || pet.status !== PET_STATUS.AVAILABLE) {
    return (
      <>
        <PageHeader title="Mascota no disponible" />
        <p>Esta mascota ya no está disponible para adopción.</p>
        <Link to="/adoptante/buscar">Volver a la búsqueda</Link>
      </>
    )
  }

  // Una sola solicitud por mascota (la regla de Firestore también lo impide)
  if (alreadyRequested && dialog === null) {
    return (
      <>
        <PageHeader title="Solicitud ya enviada" />
        <p>Ya enviaste una solicitud para adoptar a {pet.name}.</p>
        <Link to="/adoptante/solicitudes">Ver mis solicitudes</Link>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Solicitud de adopción"
        subtitle={`Contanos sobre vos y tu hogar para adoptar a ${pet.name}.`}
      />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          <Select
            label="Tipo de vivienda"
            name="housingType"
            value={values.housingType}
            onChange={handleChange}
            options={HOUSING_TYPES}
            placeholder="Elegí una opción"
            error={errors.housingType}
          />
          <Select
            label="¿Cuántas horas pasaría solo?"
            name="hoursAlone"
            value={values.hoursAlone}
            onChange={handleChange}
            options={HOURS_ALONE}
            placeholder="Elegí una opción"
            error={errors.hoursAlone}
          />
          <Input
            label="¿Quiénes viven en tu hogar?"
            name="householdMembers"
            value={values.householdMembers}
            onChange={handleChange}
            hint="Por ejemplo: 2 adultos y un nene de 8 años"
            maxLength={LIMITS.householdMembers.max}
            error={errors.householdMembers}
          />
        </div>

        <div className={styles.grid}>
          <div className={styles.question}>
            <ToggleGroup
              label="¿Tenés patio o balcón?"
              name="hasYard"
              value={values.hasYard}
              onChange={handleChange}
              error={errors.hasYard}
            />
            {values.hasYard === 'si' && (
              <ToggleGroup
                label="¿Está cerrado o tiene red de protección?"
                name="hasSafetyNet"
                value={values.hasSafetyNet}
                onChange={handleChange}
                error={errors.hasSafetyNet}
              />
            )}
          </div>

          <div className={styles.question}>
            <ToggleGroup
              label="¿Tenés otras mascotas?"
              name="hasOtherPets"
              value={values.hasOtherPets}
              onChange={handleChange}
              error={errors.hasOtherPets}
            />
            {values.hasOtherPets === 'si' && (
              <Input
                label="¿Qué mascotas tenés?"
                name="otherPetsDetail"
                value={values.otherPetsDetail}
                onChange={handleChange}
                hint="Por ejemplo: 1 perro y 2 gatos"
                maxLength={LIMITS.otherPets.max}
                error={errors.otherPetsDetail}
              />
            )}
          </div>

          <div className={styles.question}>
            <ToggleGroup
              label="¿Tuviste mascotas antes?"
              name="hasExperience"
              value={values.hasExperience}
              onChange={handleChange}
              error={errors.hasExperience}
            />
            {values.hasExperience === 'si' && (
              <Select
                label="¿Cuántos años de experiencia tenés?"
                name="experienceYears"
                value={values.experienceYears}
                onChange={handleChange}
                options={EXPERIENCE_RANGES}
                placeholder="Elegí una opción"
                error={errors.experienceYears}
              />
            )}
          </div>
        </div>

        <div className={styles.texts}>
          <Input
            label="Contanos sobre vos"
            name="aboutAdopter"
            value={values.aboutAdopter}
            onChange={handleChange}
            multiline
            maxLength={LIMITS.requestText.max}
            error={errors.aboutAdopter}
          />
          <Input
            label={`¿Por qué querés adoptar a ${pet.name}?`}
            name="motivation"
            value={values.motivation}
            onChange={handleChange}
            multiline
            maxLength={LIMITS.requestText.max}
            error={errors.motivation}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate(`/adoptante/mascotas/${pet.id}`)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Enviar solicitud
          </Button>
        </div>
      </form>

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

export default RequestAdoptionPage
