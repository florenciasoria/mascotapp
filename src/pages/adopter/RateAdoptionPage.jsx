import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ResultDialog from '@/components/ui/ResultDialog'
import StarRating from '@/components/ratings/StarRating'
import { useAuth } from '@/hooks/useAuth'
import { getRequest } from '@/services/adoptionService'
import { createRating, getAdopterRatings } from '@/services/ratingService'
import { REQUEST_STATUS } from '@/utils/requestOptions'
import { LIMITS, validateRatingForm } from '@/utils/validators'
import { focusFirstInvalidField } from '@/utils/forms'
import styles from './RateAdoptionPage.module.css'

// Sin puntajes iniciales: el adoptante elige cada uno
const EMPTY_RATING = { shelterScore: '', processScore: '', comment: '' }

/** Calificación de una adopción aceptada (CU006): atención del refugio, proceso y comentario. */
function RateAdoptionPage() {
  const { requestId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [adoption, setAdoption] = useState(null)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState(EMPTY_RATING)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let isActive = true

    Promise.all([getRequest(requestId), getAdopterRatings(user.uid)])
      .then(([request, ratings]) => {
        if (!isActive) return
        setAdoption(request)
        setAlreadyRated(ratings.some((rating) => rating.id === requestId))
      })
      .catch(() => isActive && setAdoption(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [requestId, user.uid])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateRatingForm(values)
    setErrors(validationErrors)
    if (focusFirstInvalidField(event.currentTarget, validationErrors)) {
      return
    }

    setIsSubmitting(true)
    try {
      await createRating(adoption, values)
      setDialog({
        type: 'success',
        title: '¡Gracias por calificar!',
        message: `Tu opinión ayuda a ${adoption.shelterName} a seguir mejorando.`,
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos enviar la calificación. Intentá nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleDialogClose() {
    const wasSuccess = dialog?.type === 'success'
    setDialog(null)
    if (wasSuccess) {
      navigate('/adoptante/historial')
    }
  }

  if (isLoading) {
    return <p role="status">Cargando…</p>
  }

  // Solo se califica una adopción aceptada propia (las reglas también lo exigen)
  if (!adoption || adoption.status !== REQUEST_STATUS.ACCEPTED) {
    return (
      <>
        <PageHeader title="Adopción no encontrada" />
        <Link to="/adoptante/historial">Volver al historial</Link>
      </>
    )
  }

  if (alreadyRated && dialog === null) {
    return (
      <>
        <PageHeader title="Ya calificaste esta adopción" />
        <p>Solo se puede calificar una vez cada adopción.</p>
        <Link to="/adoptante/historial">Volver al historial</Link>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Calificar adopción"
        subtitle={`Contanos cómo fue la adopción de ${adoption.pet.name} con ${adoption.shelterName}.`}
      />

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <StarRating
          label="¿Cómo fue la atención del refugio?"
          name="shelterScore"
          value={values.shelterScore}
          onChange={handleChange}
          error={errors.shelterScore}
        />
        <StarRating
          label="¿Cómo fue el proceso de adopción?"
          name="processScore"
          value={values.processScore}
          onChange={handleChange}
          error={errors.processScore}
        />
        <Input
          label="Comentario (opcional)"
          name="comment"
          value={values.comment}
          onChange={handleChange}
          hint="Contá cómo fue tu experiencia"
          multiline
          maxLength={LIMITS.ratingComment.max}
          error={errors.comment}
        />

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/adoptante/historial')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Enviar calificación
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

export default RateAdoptionPage
