// Montos rápidos del formulario de donación
export const DONATION_PRESETS = [5000, 10000, 15000]

// Estado de la donación según el pago en Mercado Pago (lo actualiza el webhook)
export const DONATION_STATUS = {
  PENDING: 'pendiente',
  APPROVED: 'aprobada',
  REJECTED: 'rechazada',
}

export const DONATION_STATUS_LABELS = {
  [DONATION_STATUS.PENDING]: 'Pendiente de pago',
  [DONATION_STATUS.APPROVED]: 'Aprobada',
  [DONATION_STATUS.REJECTED]: 'Rechazada',
}

// Color de la pastilla de cada estado
export const DONATION_STATUS_TONES = {
  [DONATION_STATUS.PENDING]: 'warning',
  [DONATION_STATUS.APPROVED]: 'success',
  [DONATION_STATUS.REJECTED]: 'danger',
}

// Tipos de medio de pago que informa Mercado Pago
const PAYMENT_TYPE_LABELS = {
  credit_card: 'Tarjeta de crédito',
  debit_card: 'Tarjeta de débito',
  prepaid_card: 'Tarjeta prepaga',
  account_money: 'Dinero en cuenta de Mercado Pago',
  ticket: 'Efectivo (Pago Fácil / Rapipago)',
}

/**
 * Medio de pago de una donación según su comprobante: "Tarjeta de crédito (visa)".
 * @param {object} [receipt] - Comprobante guardado por el webhook.
 * @returns {string} "Mercado Pago" si todavía no hay comprobante.
 */
export function formatPaymentMethod(receipt) {
  if (!receipt?.paymentType) return 'Mercado Pago'
  const type = PAYMENT_TYPE_LABELS[receipt.paymentType] ?? receipt.paymentType
  // La marca solo suma en las tarjetas (en los demás tipos repite el tipo)
  const isCard = receipt.paymentType.endsWith('_card')
  return isCard && receipt.paymentMethod ? `${type} (${receipt.paymentMethod})` : type
}


// Detalle del pago que informa Mercado Pago (los que no están en la lista se muestran tal cual)
const STATUS_DETAIL_LABELS = {
  accredited: 'Acreditado',
}

/**
 * Detalle del pago para mostrar: "accredited" → "Acreditado".
 * @param {string|null} [detail]
 * @returns {string}
 */
export function formatStatusDetail(detail) {
  return STATUS_DETAIL_LABELS[detail] ?? detail ?? '—'
}

/**
 * Importe en pesos argentinos: 15000 → "$ 15.000".
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Total y cantidad de donaciones por refugio, del que más recibió al que menos.
 * @param {object[]} donations
 * @returns {{shelterId: string, shelterName: string, amount: number, count: number}[]}
 */
export function sumByShelter(donations) {
  const byShelter = new Map()
  donations.forEach((donation) => {
    const shelter = byShelter.get(donation.shelterId) ?? {
      shelterId: donation.shelterId,
      shelterName: donation.shelterName,
      amount: 0,
      count: 0,
    }
    shelter.amount += donation.amount
    shelter.count += 1
    byShelter.set(donation.shelterId, shelter)
  })
  return [...byShelter.values()].sort((a, b) => b.amount - a.amount)
}
