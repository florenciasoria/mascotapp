import Card from '@/components/ui/Card'
import StatusBadge from '@/components/ui/StatusBadge'
import { formatDate } from '@/utils/dates'
import { DONATION_STATUS_LABELS, formatCurrency, PAYMENT_METHOD_LABELS } from '@/utils/donationOptions'
import styles from './DonationCard.module.css'

// Tarjeta de una donación. La usan el adoptante (title = refugio) y el refugio (title = adoptante).
// showCard: muestra los últimos 4 números de la tarjeta (solo para quien donó).
function DonationCard({ donation, title, subtitle, showCard = false }) {
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
          <dd>
            {PAYMENT_METHOD_LABELS[donation.paymentMethod]}
            {showCard && ` terminada en ${donation.cardLast4}`}
          </dd>
        </div>
      </dl>
      <StatusBadge tone="success">{DONATION_STATUS_LABELS[donation.status]}</StatusBadge>
    </Card>
  )
}

export default DonationCard
