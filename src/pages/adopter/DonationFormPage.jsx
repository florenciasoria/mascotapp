import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import ToggleGroup from '@/components/ui/ToggleGroup'
import Button from '@/components/ui/Button'
import ResultDialog from '@/components/ui/ResultDialog'
import { useAuth } from '@/hooks/useAuth'
import { getPublicShelter } from '@/services/shelterService'
import { createDonation } from '@/services/donationService'
import { DONATION_PRESETS, formatCurrency } from '@/utils/donationOptions'
import { validateDonationForm } from '@/utils/validators'
import { focusFirstInvalidField } from '@/utils/forms'
import styles from './DonationFormPage.module.css'

const EMPTY_DONATION = { amount: '', cardNumber: '', cardHolder: '', expiry: '', cvv: '' }

// Montos rápidos como opciones del ToggleGroup: { value: '5000', label: '$ 5.000' }
const PRESET_OPTIONS = DONATION_PRESETS.map((amount) => ({
  value: String(amount),
  label: formatCurrency(amount),
}))

function DonationFormPage() {
  const { shelterId } = useParams()
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [shelter, setShelter] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [values, setValues] = useState(EMPTY_DONATION)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialog, setDialog] = useState(null)

  useEffect(() => {
    let isActive = true

    getPublicShelter(shelterId)
      .then((result) => isActive && setShelter(result))
      .catch(() => isActive && setShelter(null))
      .finally(() => isActive && setIsLoading(false))

    return () => {
      isActive = false
    }
  }, [shelterId])

  // Las pastillas de monto y "Otro importe" escriben en el mismo campo (amount)
  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationErrors = validateDonationForm(values)
    setErrors(validationErrors)
    if (focusFirstInvalidField(event.currentTarget, validationErrors)) {
      return
    }

    setIsSubmitting(true)
    try {
      await createDonation({ uid: user.uid, name: profile.name }, shelter, values)
      setDialog({
        type: 'success',
        title: '¡Donación registrada!',
        message: `Tu donación de ${formatCurrency(Number(values.amount))} a ${shelter.name} fue registrada correctamente.`,
      })
    } catch {
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: 'No pudimos registrar la donación. Intentá nuevamente.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Al cerrar el diálogo de éxito, vamos a Mis donaciones
  function handleDialogClose() {
    const wasSuccess = dialog?.type === 'success'
    setDialog(null)
    if (wasSuccess) {
      navigate('/adoptante/donaciones')
    }
  }

  if (isLoading) {
    return <p role="status">Cargando…</p>
  }

  if (!shelter) {
    return (
      <>
        <PageHeader title="Refugio no encontrado" />
        <Link to="/adoptante/donaciones/nueva">Elegir otro refugio</Link>
      </>
    )
  }

  return (
    <>
      <PageHeader title={`Donación a ${shelter.name}`} />

      <p className={styles.simulated}>
        Donación simulada: no se realiza ningún cobro y solo se guardan los últimos 4 números de la
        tarjeta.
      </p>

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <ToggleGroup
          label="Importe"
          name="amount"
          value={values.amount}
          onChange={handleChange}
          options={PRESET_OPTIONS}
          error={errors.amount}
        />
        <Input
          label="Otro importe"
          name="amount"
          type="number"
          inputMode="numeric"
          min="100"
          step="1"
          value={values.amount}
          onChange={handleChange}
          hint="En pesos, sin centavos"
        />

        <Input
          label="Número de tarjeta"
          name="cardNumber"
          inputMode="numeric"
          maxLength={19}
          autoComplete="off"
          value={values.cardNumber}
          onChange={handleChange}
          error={errors.cardNumber}
        />
        <Input
          label="Nombre del titular"
          name="cardHolder"
          autoComplete="off"
          value={values.cardHolder}
          onChange={handleChange}
          error={errors.cardHolder}
        />
        <div className={styles.row}>
          <Input
            label="Vencimiento"
            name="expiry"
            placeholder="MM/AA"
            maxLength={5}
            autoComplete="off"
            value={values.expiry}
            onChange={handleChange}
            error={errors.expiry}
          />
          <Input
            label="CVV"
            name="cvv"
            inputMode="numeric"
            maxLength={4}
            autoComplete="off"
            value={values.cvv}
            onChange={handleChange}
            error={errors.cvv}
          />
        </div>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/adoptante/donaciones/nueva')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Donar
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

export default DonationFormPage
