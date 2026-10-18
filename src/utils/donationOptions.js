// Montos rápidos del formulario de donación (como en el diseño)
export const DONATION_PRESETS = [5000, 10000, 15000]

export const DONATION_STATUS_LABELS = {
  registrada: 'Registrada',
}

export const PAYMENT_METHOD_LABELS = {
  tarjeta: 'Tarjeta',
}

// Importe en pesos argentinos: 15000 → "$ 15.000"
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(amount)
}
