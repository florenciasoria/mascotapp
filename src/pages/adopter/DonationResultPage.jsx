import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import PageHeader from '@/components/ui/PageHeader'
import Card from '@/components/ui/Card'
import ButtonLink from '@/components/ui/ButtonLink'
import { subscribeToDonation } from '@/services/donationService'
import { DONATION_STATUS, formatCurrency } from '@/utils/donationOptions'
import styles from './DonationResultPage.module.css'

// Tiempo de espera de la confirmación antes de mostrar el pago como pendiente
const CONFIRMATION_WAIT_MS = 15000

/** Mensaje según el estado confirmado por el servidor (no el que viene en la URL). */
function getContent(donation, isTakingLong) {
  const detail = `${formatCurrency(donation.amount)} a ${donation.shelterName}`

  if (donation.status === DONATION_STATUS.APPROVED) {
    return {
      icon: '✓',
      tone: 'success',
      title: '¡Gracias por tu donación!',
      text: `Tu donación de ${detail} fue aprobada. Podés ver el comprobante en Mis donaciones.`,
    }
  }
  if (donation.status === DONATION_STATUS.REJECTED) {
    return {
      icon: '✕',
      tone: 'danger',
      title: 'No se pudo completar el pago',
      text: `Mercado Pago no aprobó el pago de tu donación de ${detail}. No se realizó ningún cobro.`,
      canRetry: true,
    }
  }
  if (isTakingLong) {
    return {
      icon: '⏳',
      tone: 'warning',
      title: 'Tu pago está pendiente',
      text: `Mercado Pago todavía no confirmó tu donación de ${detail}. Cuando se acredite, la vas a ver aprobada en Mis donaciones.`,
    }
  }
  return {
    icon: '⏳',
    tone: 'warning',
    title: 'Estamos confirmando tu pago…',
    text: 'Esto puede tardar unos segundos. No cierres esta página.',
    isConfirming: true,
  }
}

/** Resultado de una donación al volver de Mercado Pago: se actualiza sola cuando el pago se confirma. */
function DonationResultPage() {
  const [searchParams] = useSearchParams()
  const donationId = searchParams.get('external_reference') ?? ''
  // El id forma parte de una ruta de Firestore: si no es válido, no se consulta
  const isValidId = /^[A-Za-z0-9]+$/.test(donationId)
  const [donation, setDonation] = useState(undefined) // undefined: cargando · null: no encontrada
  const [isTakingLong, setIsTakingLong] = useState(false)

  useEffect(() => {
    if (!isValidId) return undefined

    const unsubscribe = subscribeToDonation(donationId, setDonation)
    const timer = setTimeout(() => setIsTakingLong(true), CONFIRMATION_WAIT_MS)

    return () => {
      unsubscribe()
      clearTimeout(timer)
    }
  }, [donationId, isValidId])

  if (!isValidId || donation === null) {
    return (
      <>
        <PageHeader title="No encontramos la donación" />
        <Link to="/adoptante/donaciones">Ir a Mis donaciones</Link>
      </>
    )
  }

  if (donation === undefined) {
    return <p role="status">Cargando…</p>
  }

  const content = getContent(donation, isTakingLong)

  return (
    <>
      <PageHeader title="Resultado de tu donación" />

      <Card className={`${styles.result} ${styles[content.tone]}`} role="status" aria-live="polite">
        <span className={styles.icon} aria-hidden="true">
          {content.icon}
        </span>
        <h2 className={styles.title}>{content.title}</h2>
        <p className={styles.text}>{content.text}</p>

        {!content.isConfirming && (
          <div className={styles.actions}>
            {content.canRetry && (
              <ButtonLink
                to={`/adoptante/donaciones/nueva/${donation.shelterId}`}
                variant="secondary"
              >
                Intentar de nuevo
              </ButtonLink>
            )}
            <ButtonLink to="/adoptante/donaciones">Ver mis donaciones</ButtonLink>
          </div>
        )}
      </Card>
    </>
  )
}

export default DonationResultPage
