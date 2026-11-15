// Cloud Functions de MascotApp: pagos de donaciones con Mercado Pago (Checkout Pro, API de Orders).
import { createHmac, timingSafeEqual } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions'
import { HttpsError, onCall, onRequest } from 'firebase-functions/https'
import * as logger from 'firebase-functions/logger'
import { defineSecret } from 'firebase-functions/params'

initializeApp()
const db = getFirestore()

// Misma región que Firestore (Santiago) y un tope de instancias para controlar costos
setGlobalOptions({ region: 'southamerica-west1', maxInstances: 10 })

// Access Token de Mercado Pago: se guarda en Secret Manager, nunca en el código
const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN')

// Firma secreta del webhook: permite comprobar que los avisos vienen de Mercado Pago
const MP_WEBHOOK_SECRET = defineSecret('MP_WEBHOOK_SECRET')

const MP_API_URL = 'https://api.mercadopago.com'
const APP_URL = 'https://mascotapp-ac2c8.web.app'
// Ids de documentos de Firestore: solo letras y números. Así un "/" no puede cambiar la ruta.
const DOC_ID_PATTERN = /^[A-Za-z0-9]+$/
const MIN_AMOUNT = 100
const MAX_AMOUNT = 1000000

/**
 * Perfil de un usuario, o null si no existe.
 * @param {string} uid
 * @returns {Promise<object|null>}
 */
async function getUserProfile(uid) {
  const snapshot = await db.doc(`users/${uid}`).get()
  return snapshot.exists ? snapshot.data() : null
}

/**
 * Crea una donación pendiente y su orden de pago en Mercado Pago (Checkout Pro).
 * Solo para adoptantes aprobados con el email verificado, hacia refugios aprobados.
 * @param {{shelterId: string, amount: number}} request.data
 * @returns {Promise<{checkoutUrl: string}>} URL de la página de pago de Mercado Pago.
 */
export const createDonationOrder = onCall({ secrets: [MP_ACCESS_TOKEN] }, async (request) => {
  const { auth, data } = request

  if (!auth) {
    throw new HttpsError('unauthenticated', 'Tenés que iniciar sesión para donar.')
  }
  if (!auth.token.email_verified) {
    throw new HttpsError('permission-denied', 'Verificá tu email antes de donar.')
  }

  const shelterId = data?.shelterId
  const amount = data?.amount
  if (typeof shelterId !== 'string' || !DOC_ID_PATTERN.test(shelterId)) {
    throw new HttpsError('invalid-argument', 'El refugio no es válido.')
  }
  if (!Number.isInteger(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    throw new HttpsError(
      'invalid-argument',
      'El importe debe ser un número entero entre $ 100 y $ 1.000.000.',
    )
  }

  const [adopter, shelter] = await Promise.all([
    getUserProfile(auth.uid),
    getUserProfile(shelterId),
  ])
  if (adopter?.role !== 'adoptante' || adopter.status !== 'aprobado') {
    throw new HttpsError('permission-denied', 'Solo los adoptantes aprobados pueden donar.')
  }
  if (shelter?.role !== 'refugio' || shelter.status !== 'aprobado') {
    throw new HttpsError('failed-precondition', 'Este refugio no puede recibir donaciones.')
  }

  // La donación se crea primero: su id identifica la orden en Mercado Pago (external_reference)
  const donationRef = db.collection('donations').doc()
  await donationRef.set({
    adopterId: auth.uid,
    adopterName: adopter.name,
    shelterId,
    shelterName: shelter.name,
    neighborhood: shelter.neighborhood,
    amount,
    status: 'pendiente',
    createdAt: FieldValue.serverTimestamp(),
  })

  // Mercado Pago pide los importes como texto con dos decimales
  const price = amount.toFixed(2)
  const resultUrl = `${APP_URL}/adoptante/donaciones/resultado`

  const response = await fetch(`${MP_API_URL}/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MP_ACCESS_TOKEN.value()}`,
      // Si la misma donación se reintenta, Mercado Pago no crea una orden duplicada
      'X-Idempotency-Key': donationRef.id,
    },
    body: JSON.stringify({
      type: 'online',
      processing_mode: 'manual',
      total_amount: price,
      external_reference: donationRef.id,
      expiration_time: 'P1D',
      description: `Donación a ${shelter.name}`,
      items: [{ title: `Donación a ${shelter.name}`, unit_price: price, quantity: 1 }],
      config: {
        online: {
          success_url: resultUrl,
          failure_url: resultUrl,
          pending_url: resultUrl,
          auto_return: 'all',
        },
      },
    }),
  })
  const order = await response.json()

  if (!response.ok) {
    logger.error('Mercado Pago no creó la orden', { status: response.status, order })
    // No queda una donación pendiente de un pago que nunca se pudo iniciar
    await donationRef.delete()
    throw new HttpsError('unavailable', 'No pudimos conectar con Mercado Pago. Intentá nuevamente.')
  }

  await donationRef.update({ orderId: order.id })
  return { checkoutUrl: order.checkout_url }
})

// Estados de un pago o una orden de Mercado Pago que significan que no se cobró
const FAILED_STATUSES = ['failed', 'rejected', 'canceled', 'cancelled', 'expired']

/**
 * Pago que representa a la orden: el aprobado si hay uno; si no, el último intento.
 * En Checkout Pro el comprador puede reintentar con otra tarjeta dentro de la misma orden.
 * @param {object} order - Orden de Mercado Pago.
 * @returns {object|undefined}
 */
function getMainPayment(order) {
  const payments = order.transactions?.payments ?? []
  return payments.find((payment) => payment.status === 'processed') ?? payments.at(-1)
}

/**
 * Estado de la donación según la orden y su pago. Un rechazo de tarjeta no cierra la orden
 * (se puede reintentar), por eso también se mira el estado del pago.
 * @param {object} order
 * @param {object|undefined} payment - El de getMainPayment.
 * @returns {'aprobada'|'rechazada'|'pendiente'}
 */
function toDonationStatus(order, payment) {
  if (order.status === 'processed' || payment?.status === 'processed') return 'aprobada'
  if (FAILED_STATUSES.includes(order.status) || FAILED_STATUSES.includes(payment?.status)) {
    return 'rechazada'
  }
  return 'pendiente'
}

/**
 * Comprueba que el aviso lo firmó Mercado Pago con la firma secreta de la aplicación.
 * Firma = HMAC SHA-256 de "id:<data.id>;request-id:<x-request-id>;ts:<ts>;".
 * @param {object} req - Pedido HTTP recibido.
 * @param {string} dataId - Id de la orden informado en el aviso.
 * @returns {boolean}
 */
function isValidSignature(req, dataId) {
  const parts = Object.fromEntries(
    (req.get('x-signature') ?? '').split(',').map((part) => part.trim().split('=')),
  )
  const requestId = req.get('x-request-id') ?? ''
  if (!parts.ts || !parts.v1) return false

  // Mercado Pago pide el id en minúsculas si es alfanumérico; se aceptan ambas formas
  return [dataId.toLowerCase(), dataId].some((id) => {
    const manifest = `id:${id};request-id:${requestId};ts:${parts.ts};`
    const expected = createHmac('sha256', MP_WEBHOOK_SECRET.value()).update(manifest).digest('hex')
    // Comparación en tiempo constante, para no dar pistas sobre la firma
    return (
      expected.length === parts.v1.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1))
    )
  })
}

/**
 * Webhook de Mercado Pago: recibe los avisos de órdenes, consulta la orden a la API
 * (no confía en el aviso) y guarda en la donación su estado y el comprobante del pago.
 * Responde 200 para que Mercado Pago no reintente, salvo error temporal (500).
 */
export const mercadoPagoWebhook = onRequest(
  { secrets: [MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET] },
  async (req, res) => {
    const orderId = req.query['data.id'] ?? req.body?.data?.id
    const type = req.query.type ?? req.body?.type

    if (req.method !== 'POST' || type !== 'order' || typeof orderId !== 'string') {
      res.status(200).send('Ignorado')
      return
    }
    if (!isValidSignature(req, orderId)) {
      logger.warn('Aviso con firma inválida', { orderId })
      res.status(401).send('Firma inválida')
      return
    }

    const response = await fetch(`${MP_API_URL}/v1/orders/${encodeURIComponent(orderId)}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN.value()}` },
    })
    // 400 o 404: el id no corresponde a una orden (por ejemplo, una notificación simulada)
    if (response.status === 400 || response.status === 404) {
      logger.warn('La orden del aviso no existe', { orderId, status: response.status })
      res.status(200).send('Orden inexistente')
      return
    }
    if (!response.ok) {
      // Error temporal: con 500, Mercado Pago vuelve a intentar más tarde
      logger.error('No se pudo consultar la orden', { orderId, status: response.status })
      res.status(500).send('Error al consultar la orden')
      return
    }
    const order = await response.json()

    const donationId = order.external_reference
    if (typeof donationId !== 'string' || !DOC_ID_PATTERN.test(donationId)) {
      logger.error('La orden no tiene una donación asociada válida', { orderId })
      res.status(200).send('Sin donación')
      return
    }

    const donationRef = db.doc(`donations/${donationId}`)
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(donationRef)
      if (!snapshot.exists) {
        logger.error('No existe la donación de la orden', { orderId, donationId })
        return
      }
      const donation = snapshot.data()
      if (donation.orderId !== order.id || order.total_amount !== donation.amount.toFixed(2)) {
        logger.error('La orden no coincide con la donación', { orderId, donationId })
        return
      }
      // Una aprobada ya no cambia (avisos repetidos). Una rechazada sí puede pasar a aprobada
      // si el comprador reintentó con otra tarjeta en la misma orden.
      if (donation.status === 'aprobada') return

      const payment = getMainPayment(order)
      const status = toDonationStatus(order, payment)
      transaction.update(donationRef, {
        status,
        // Comprobante: los datos del pago tal como los informa Mercado Pago
        receipt: {
          orderId: order.id,
          paymentId: payment?.id ?? null,
          // Número de operación que Mercado Pago le muestra al comprador
          operationNumber: payment?.reference?.id ? String(payment.reference.id) : null,
          mpStatus: order.status,
          statusDetail: payment?.status_detail ?? order.status_detail ?? null,
          paymentMethod: payment?.payment_method?.id ?? null,
          paymentType: payment?.payment_method?.type ?? null,
          installments: payment?.payment_method?.installments ?? null,
          paidAmount: Number(payment?.paid_amount ?? order.total_paid_amount ?? 0),
          // Cupón de Mercado Pago para pagos en efectivo (Pago Fácil, Rapipago), si lo hay
          ticketUrl: payment?.payment_method?.ticket_url ?? null,
          approvedAt:
            status === 'aprobada' ? Timestamp.fromDate(new Date(order.last_updated_date)) : null,
        },
        updatedAt: FieldValue.serverTimestamp(),
      })
    })

    res.status(200).send('OK')
  },
)
