import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import StatusBadge from '@/components/ui/StatusBadge'
import DownloadReportButton from '@/components/ui/DownloadReportButton'
import { formatDate, formatDateTime } from '@/utils/dates'
import {
  DONATION_STATUS_LABELS,
  DONATION_STATUS_TONES,
  formatCurrency,
  formatPaymentMethod,
  formatStatusDetail,
} from '@/utils/donationOptions'
import styles from './DonationReceiptDialog.module.css'

/** Datos del comprobante como pares [dato, valor]: se usan en pantalla y en el PDF. */
function getReceiptRows(donation) {
  const { receipt } = donation
  const installments =
    receipt.installments > 1
      ? `, ${receipt.installments} cuotas`
      : receipt.installments
        ? ', 1 cuota'
        : ''

  return [
    ['Refugio', donation.shelterName],
    ['Donante', donation.adopterName],
    ['Importe pagado', formatCurrency(receipt.paidAmount)],
    ['Fecha de la donación', formatDate(donation.createdAt)],
    ['Fecha de aprobación', formatDateTime(receipt.approvedAt)],
    ['Medio de pago', `${formatPaymentMethod(receipt)}${installments}`],
    ['Detalle', formatStatusDetail(receipt.statusDetail)],
    ['N° de operación', receipt.paymentId ?? '—'],
    ['N° de orden', receipt.orderId],
  ]
}

/**
 * Comprobante de una donación con los datos del pago informados por Mercado Pago,
 * con descarga en PDF.
 * @param {object} props
 * @param {object} props.donation - Donación aprobada (con receipt).
 * @param {boolean} props.isOpen - Si está abierto.
 * @param {() => void} props.onClose - Cierra el comprobante.
 */
function DonationReceiptDialog({ donation, isOpen, onClose }) {
  const { receipt } = donation
  const rows = getReceiptRows(donation)
  const statusLabel = DONATION_STATUS_LABELS[donation.status]

  function getReport() {
    return {
      title: 'Comprobante de donación',
      subtitle: `Donación de ${donation.adopterName} a ${donation.shelterName}`,
      totals: [
        { label: 'Importe pagado', value: formatCurrency(receipt.paidAmount) },
        { label: 'Estado', value: statusLabel },
      ],
      tables: [
        {
          title: 'Datos del pago (informados por Mercado Pago)',
          columns: ['Dato', 'Valor'],
          rows,
        },
      ],
      fileName: `comprobante ${receipt.paymentId ?? donation.id}`,
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Comprobante de donación" wide>
      <div className={styles.status}>
        <StatusBadge tone={DONATION_STATUS_TONES[donation.status]}>{statusLabel}</StatusBadge>
      </div>

      <dl className={styles.details}>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {receipt.ticketUrl && (
        <p className={styles.note}>
          <a href={receipt.ticketUrl} target="_blank" rel="noreferrer">
            Ver cupón de Mercado Pago
          </a>
        </p>
      )}
      <p className={styles.note}>Datos informados por Mercado Pago.</p>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onClose}>
          Cerrar
        </Button>
        <DownloadReportButton label="Descargar PDF" variant="primary" getReport={getReport} />
      </div>
    </Modal>
  )
}

export default DonationReceiptDialog
