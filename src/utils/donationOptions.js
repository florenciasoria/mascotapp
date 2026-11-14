// Montos rápidos del formulario de donación
export const DONATION_PRESETS = [5000, 10000, 15000]

// Las donaciones son simuladas: quedan registradas y se pagan con tarjeta
export const DONATION_STATUS = {
  REGISTERED: 'registrada',
}

export const DONATION_STATUS_LABELS = {
  [DONATION_STATUS.REGISTERED]: 'Registrada',
}

export const PAYMENT_METHODS = {
  CARD: 'tarjeta',
}

export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CARD]: 'Tarjeta',
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
