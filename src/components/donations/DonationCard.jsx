import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate } from '@/utils/dates'
import {
  DONATION_STATUS_LABELS,
  DONATION_STATUS_TONES,
  formatCurrency,
  formatPaymentMethod,
} from '@/utils/donationOptions'
import styles from './DonationCard.module.css'

/**
 * Tarjeta de una donación.
 * @param {object} props
 * @param {object} props.donation - Donación a mostrar.
 * @param {string} props.title - Título: el refugio o el adoptante, según quién la vea.
 * @param {string} [props.subtitle] - Ubicación del refugio.
 */
function DonationCard({ donation, title, subtitle }) {
  const titleId = `donation-${donation.id}`

  return (
    <Card as="article" className={styles.card} aria-labelledby={titleId}>
      <h3 id={titleId} className={styles.title}>
        {title}
      </h3>
      {subtitle && (
        <p className={styles.subtitle}>
          <span aria-hidden="true">📍</span> {subtitle}
        </p>
      )}
      <dl className={styles.facts}>
        <div>
          <dt>Importe</dt>
          <dd>{formatCurrency(donation.amount)}</dd>
        </div>
        <div>
          <dt>Fecha</dt>
          <dd>{formatDate(donation.createdAt)}</dd>
        </div>
        <div>
          <dt>Medio de pago</dt>
          <dd>{formatPaymentMethod(donation.receipt)}</dd>
        </div>
      </dl>
      <StatusBadge tone={DONATION_STATUS_TONES[donation.status]}>
        {DONATION_STATUS_LABELS[donation.status]}
      </StatusBadge>
    </Card>
  )
}

export default DonationCard
