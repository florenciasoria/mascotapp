import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Input from '@/components/ui/Input'
import ToggleGroup from '@/components/ui/ToggleGroup'
import Button from '@/components/ui/Button'
import ResultDialog from '@/components/ui/ResultDialog'
import { getPublicShelter } from '@/services/shelterService'
import { startDonationPayment } from '@/services/donationService'
import { DONATION_PRESETS, formatCurrency } from '@/utils/donationOptions'
import { validateDonationForm } from '@/utils/validators'
import { focusFirstInvalidField, withoutError } from '@/utils/forms'
import styles from './DonationFormPage.module.css'

const EMPTY_DONATION = { amount: '' }

// Montos rápidos como opciones: { value: "5000", label: "$ 5.000" }
const PRESET_OPTIONS = DONATION_PRESETS.map((amount) => ({
  value: String(amount),
  label: formatCurrency(amount),
}))

/** Formulario de donación a un refugio (CU005): se elige el importe y el pago se completa en Mercado Pago. */
function DonationFormPage() {
  const { shelterId } = useParams()
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

  // Los montos rápidos y "Otro importe" comparten el campo amount
  function handleChange(event) {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    setErrors((previous) => withoutError(previous, name))
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
      const checkoutUrl = await startDonationPayment(shelter.id, Number(values.amount))
      // Sale de la app: el pago se completa en Mercado Pago (el botón sigue cargando hasta irse)
      window.location.assign(checkoutUrl)
    } catch (error) {
      // Los rechazos del servidor traen un mensaje en español; los demás errores, uno genérico
      const hasServerMessage =
        error.code?.startsWith('functions/') && error.code !== 'functions/internal'
      setDialog({
        type: 'error',
        title: '¡Error!',
        message: hasServerMessage
          ? error.message
          : 'No pudimos iniciar el pago. Intentá nuevamente.',
      })
      setIsSubmitting(false)
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

      <p className={styles.notice}>
        Vas a completar el pago en Mercado Pago. MascotApp no ve ni guarda los datos de tu tarjeta.
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

        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => navigate('/adoptante/donaciones/nueva')}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Continuar a Mercado Pago
          </Button>
        </div>
      </form>

      <ResultDialog
        isOpen={dialog !== null}
        onClose={() => setDialog(null)}
        type={dialog?.type}
        title={dialog?.title ?? ''}
        message={dialog?.message}
      />
    </>
  )
}

export default DonationFormPage
