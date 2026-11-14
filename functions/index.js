// Cloud Functions de MascotApp: pagos de donaciones con Mercado Pago (Checkout Pro, API de Orders).
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions'
import { HttpsError, onCall } from 'firebase-functions/https'
import * as logger from 'firebase-functions/logger'
import { defineSecret } from 'firebase-functions/params'

initializeApp()
const db = getFirestore()

// Misma región que Firestore (Santiago) y un tope de instancias para controlar costos
setGlobalOptions({ region: 'southamerica-west1', maxInstances: 10 })

// Access Token de Mercado Pago: se guarda en Secret Manager, nunca en el código
const MP_ACCESS_TOKEN = defineSecret('MP_ACCESS_TOKEN')

const MP_API_URL = 'https://api.mercadopago.com'
const APP_URL = 'https://mascotapp-ac2c8.web.app'
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
  // El id del refugio forma parte de una ruta de Firestore: no puede tener "/"
  if (typeof shelterId !== 'string' || !/^[A-Za-z0-9]+$/.test(shelterId)) {
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
