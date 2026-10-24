import { useState } from 'react'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { focusFirstInvalidField, withoutError } from '@/utils/forms'
import { AGE_UNITS, COLORS, SEXES, SIZES, SPECIES } from '@/utils/petOptions'
import { LIMITS, validatePetForm } from '@/utils/validators'
import ImageUpload from './ImageUpload'
import styles from './PetForm.module.css'

/**
 * Formulario de alta y edición de una mascota (CU001).
 * Valida los datos y los entrega con onSubmit(values, imageFile).
 * @param {object} props
 * @param {object} props.initialValues - Valores iniciales del formulario.
 * @param {string} [props.currentImageUrl] - Foto actual (al editar).
 * @param {string} props.submitLabel - Texto del botón de envío.
 * @param {(values: object, imageFile: File|null) => Promise<void>} props.onSubmit - Guarda la mascota.
 * @param {() => void} props.onCancel - Cancela y vuelve al listado.
 * @param {boolean} [props.isEditing] - Si es true, "Guardar" se habilita solo cuando hay cambios.
 */
function PetForm({
  initialValues,
  currentImageUrl,
  submitLabel,
  onSubmit,
  onCancel,
  isEditing = false,
}) {
  const [values, setValues] = useState(initialValues)
  const [imageFile, setImageFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasChanges =
    imageFile !== null ||
    Object.keys(initialValues).some((field) => values[field] !== initialValues[field])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => withoutError(previous, name))
  }

  function handleFileChange(file) {
    setImageFile(file)
    setErrors((previous) => withoutError(previous, 'image'))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validatePetForm(values, imageFile, Boolean(currentImageUrl))
    setErrors(validationErrors)
    if (focusFirstInvalidField(event.target, validationErrors)) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(values, imageFile)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <Input
          label="Nombre"
          name="name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          maxLength={LIMITS.petName.max}
          required
        />
        <Select
          label="Especie"
          name="species"
          value={values.species}
          onChange={handleChange}
          error={errors.species}
          options={SPECIES}
          placeholder="Elegí la especie"
          required
        />
        <Input
          label="Raza"
          name="breed"
          value={values.breed}
          onChange={handleChange}
          error={errors.breed}
          maxLength={LIMITS.breed.max}
          required
        />
        <Select
          label="Sexo"
          name="sex"
          value={values.sex}
          onChange={handleChange}
          error={errors.sex}
          options={SEXES}
          placeholder="Elegí el sexo"
          required
        />
        <div className={styles.ageGroup}>
          <Input
            label="Edad"
            type="number"
            name="ageValue"
            value={values.ageValue}
            onChange={handleChange}
            error={errors.ageValue}
            min={LIMITS.age.min}
            max={LIMITS.age.max}
            inputMode="numeric"
            required
          />
          <Select
            label="Meses o años"
            name="ageUnit"
            value={values.ageUnit}
            onChange={handleChange}
            error={errors.ageUnit}
            options={AGE_UNITS}
            placeholder="Elegí"
            required
          />
        </div>
        <Select
          label="Tamaño"
          name="size"
          value={values.size}
          onChange={handleChange}
          error={errors.size}
          options={SIZES}
          placeholder="Elegí el tamaño"
          required
        />
        <Select
          label="Color"
          name="color"
          value={values.color}
          onChange={handleChange}
          error={errors.color}
          options={COLORS}
          placeholder="Elegí el color"
          required
        />
      </div>

      <ImageUpload
        file={imageFile}
        currentUrl={currentImageUrl}
        onFileChange={handleFileChange}
        error={errors.image}
      />

      <Input
        label="Contanos un poco sobre la mascota, su personalidad y características"
        name="description"
        multiline
        value={values.description}
        onChange={handleChange}
        error={errors.description}
        maxLength={LIMITS.petDescription.max}
        required
      />

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isEditing && !hasChanges}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default PetForm
